import User from "../Models/User.js";
import ProductVariant from "../Models/ProductVariant.js";
import Inventory from "../Models/Inventory.js";
import Order from "../Models/Order.js";
import OrderItem from "../Models/OrderItem.js";
import Cart from "../Models/Cart.js";
import CartItem from "../Models/CartItem.js";

import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";
import emailService from "../Utils/emailService.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../Utils/performanceHelper.js";
import { v4 as uuidv4 } from "uuid";

class OrderService {
  /**
   * Place a new order (with transaction support)
   */
  async createOrder(userId, orderData, transaction = null) {
    try {
      const {
        products, // Array of {variantId, quantity}
        shippingAddress,
        paymentMethod,
        idempotencyKey = uuidv4(),
      } = orderData;

      // Check for duplicate order (idempotency)
      const existingOrder = await Order.findOne({
        where: { idempotencyKey },
      });

      if (existingOrder) {
        loggerService.warn(
          `Duplicate order attempt with key ${idempotencyKey}`,
        );
        return existingOrder;
      }

      // Validate all variants exist and have stock with pessimistic locking
      let totalPrice = 0;
      const orderItems = [];

      for (const product of products) {
        const variant = await ProductVariant.findByPk(product.variantId);
        if (!variant) {
          throw new AppError(
            `Product variant ${product.variantId} not found`,
            404,
          );
        }

        // Check stock with SELECT FOR UPDATE (pessimistic lock)
        const inventory = await Inventory.findOne({
          where: { variantId: product.variantId },
          ...(transaction && { transaction }),
          lock: transaction ? "UPDATE" : undefined,
        });

        const available = inventory
          ? inventory.quantityAvailable - inventory.quantityReserved
          : 0;

        if (available < product.quantity) {
          throw new AppError(
            `Insufficient stock for variant ${product.variantId}. Available: ${available}`,
            400,
          );
        }

        orderItems.push({
          variantId: product.variantId,
          quantity: product.quantity,
          price: variant.price,
        });

        totalPrice += variant.price * product.quantity;
      }

      // Create order
      const order = await Order.create(
        {
          userId,
          idempotencyKey,
          status: "pending",
          paymentStatus: "pending",
          paymentMethod,
          totalPrice,
          shippingAddress,
        },
        transaction ? { transaction } : {},
      );

      // Create order items and reserve inventory
      for (const item of orderItems) {
        await OrderItem.create(
          {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
          },
          transaction ? { transaction } : {},
        );

        // Reserve inventory
        const inventory = await Inventory.findOne({
          where: { variantId: item.variantId },
        });

        if (inventory) {
          await inventory.increment(
            "quantityReserved",
            { by: item.quantity },
            transaction ? { transaction } : {},
          );
        }
      }

      loggerService.log(`Created order ${order.id} for user ${userId}`, {
        totalPrice,
        items: orderItems.length,
      });

      // Send confirmation email (non-blocking)
      (async () => {
        try {
          const user = await User.findByPk(userId);
          const fullOrder = await this.getOrderById(order.id);
          if (user && user.email) {
            await emailService.sendOrderConfirmation(
              user.email,
              fullOrder,
              user,
            );
          }
        } catch (emailError) {
          loggerService.warn(
            `Failed to send order confirmation email`,
            emailError,
          );
        }
      })();

      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error creating order for user ${userId}`, error);
      throw new AppError("Failed to create order", 500);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId, userId = null) {
    try {
      const where = { id: orderId };
      if (userId) where.userId = userId;

      const order = await Order.findOne({
        where,
        include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      loggerService.log(`Retrieved order ${orderId}`);
      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting order ${orderId}`, error);
      throw new AppError("Failed to fetch order", 500);
    }
  }

  /**
   * Get user's orders with pagination
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const { offset } = getPaginationParams({ page, limit });

      const { count, rows } = await Order.findAndCountAll({
        where: { userId },
        include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      const pagination = getPaginationMeta(page, limit, count);

      loggerService.log(`Retrieved ${rows.length} orders for user ${userId}`, {
        page,
        limit,
        total: count,
      });
      return { rows, pagination, count };
    } catch (error) {
      loggerService.error(`Error getting orders for user ${userId}`, error);
      throw new AppError("Failed to fetch orders", 500);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, userId = null) {
    try {
      const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid order status", 400);
      }

      const where = { id: orderId };
      if (userId) where.userId = userId;

      const order = await Order.findOne({ where });
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      // If cancelling, release reserved inventory
      if (status === "cancelled" && order.status !== "cancelled") {
        const orderItems = await OrderItem.findAll({ where: { orderId } });

        for (const item of orderItems) {
          const inventory = await Inventory.findOne({
            where: { variantId: item.variantId },
          });

          if (inventory && inventory.quantityReserved >= item.quantity) {
            await inventory.decrement("quantityReserved", {
              by: item.quantity,
            });
          }
        }
      }

      await order.update({ status });
      loggerService.log(`Updated order ${orderId} status to ${status}`);

      // Send status update email (non-blocking)
      (async () => {
        try {
          const user = await User.findByPk(order.userId);
          const fullOrder = await this.getOrderById(orderId);
          if (user && user.email) {
            await emailService.sendOrderStatusUpdate(
              user.email,
              fullOrder,
              user,
              status,
            );
          }
        } catch (emailError) {
          loggerService.warn(
            `Failed to send order status update email`,
            emailError,
          );
        }
      })();

      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating order ${orderId}`, error);
      throw new AppError("Failed to update order", 500);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, paymentStatus, userId = null) {
    try {
      const validPaymentStatuses = [
        "pending",
        "completed",
        "failed",
        "refunded",
      ];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        throw new AppError("Invalid payment status", 400);
      }

      const where = { id: orderId };
      if (userId) where.userId = userId;

      const order = await Order.findOne({ where });
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      // If payment completed, confirm inventory
      if (
        paymentStatus === "completed" &&
        order.paymentStatus !== "completed"
      ) {
        const orderItems = await OrderItem.findAll({ where: { orderId } });

        for (const item of orderItems) {
          const inventory = await Inventory.findOne({
            where: { variantId: item.variantId },
          });

          if (inventory) {
            await inventory.decrement("quantityAvailable", {
              by: item.quantity,
            });
            await inventory.decrement("quantityReserved", {
              by: item.quantity,
            });
          }
        }
      }

      await order.update({ paymentStatus });
      loggerService.log(
        `Updated order ${orderId} payment status to ${paymentStatus}`,
      );

      // Send payment confirmation email if payment completed (non-blocking)
      if (paymentStatus === "completed") {
        (async () => {
          try {
            const user = await User.findByPk(order.userId);
            const fullOrder = await this.getOrderById(orderId);
            if (user && user.email) {
              await emailService.sendPaymentConfirmation(
                user.email,
                fullOrder,
                user,
              );
            }
          } catch (emailError) {
            loggerService.warn(
              `Failed to send payment confirmation email`,
              emailError,
            );
          }
        })();
      }

      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating payment for order ${orderId}`, error);
      throw new AppError("Failed to update payment status", 500);
    }
  }

  /**
   * Get all orders (admin) with pagination and filtering
   */
  async getAllOrders(page = 1, limit = 10, filters = {}) {
    try {
      const { offset } = getPaginationParams({ page, limit });

      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      const pagination = getPaginationMeta(page, limit, count);

      loggerService.log(`Retrieved ${rows.length} orders`, {
        page,
        limit,
        total: count,
      });
      return { rows, pagination, count };
    } catch (error) {
      loggerService.error("Error getting all orders", error);
      throw new AppError("Failed to fetch orders", 500);
    }
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(userId, orderData, transaction = null) {
    try {
      // Get user's cart
      const cart = await Cart.findOne({
        where: { userId },
        include: [{ model: CartItem }],
      });

      if (!cart || cart.CartItems.length === 0) {
        throw new AppError("Cart is empty", 400);
      }

      // Convert cart items to products format
      const products = cart.CartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Create order
      const order = await this.createOrder(
        userId,
        { ...orderData, products },
        transaction,
      );

      // Clear cart after successful order
      await CartItem.destroy({ where: { cartId: cart.id } });

      loggerService.log(`Created order from cart for user ${userId}`);
      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error creating order from cart for user ${userId}`,
        error,
      );
      throw new AppError("Failed to create order from cart", 500);
    }
  }
}

export default new OrderService();
