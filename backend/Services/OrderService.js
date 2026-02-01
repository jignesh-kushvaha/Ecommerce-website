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
  async createOrder(user_id, orderData, transaction = null) {
    try {
      const {
        products, // Array of {variant_id, quantity}
        shipping_address,
        payment_method,
        idempotency_key = uuidv4(),
      } = orderData;

      // Check for duplicate order (idempotency)
      const existingOrder = await Order.findOne({
        where: { idempotency_key },
      });

      if (existingOrder) {
        loggerService.warn(
          `Duplicate order attempt with key ${idempotency_key}`,
        );
        return existingOrder;
      }

      // Validate all variants exist and have stock
      let total_price = 0;
      const orderItems = [];

      for (const product of products) {
        const variant = await ProductVariant.findByPk(product.variant_id);
        if (!variant) {
          throw new AppError(
            `Product variant ${product.variant_id} not found`,
            404,
          );
        }

        // Check stock
        const inventory = await Inventory.findOne({
          where: { variant_id: product.variant_id },
        });

        const available = inventory
          ? inventory.quantity_available - inventory.quantity_reserved
          : 0;

        if (available < product.quantity) {
          throw new AppError(
            `Insufficient stock for variant ${product.variant_id}. Available: ${available}`,
            400,
          );
        }

        orderItems.push({
          variant_id: product.variant_id,
          quantity: product.quantity,
          price: variant.price,
        });

        total_price += variant.price * product.quantity;
      }

      // Create order
      const order = await Order.create(
        {
          user_id,
          idempotency_key,
          status: "pending",
          payment_status: "pending",
          payment_method,
          total_price,
          shipping_address,
        },
        transaction ? { transaction } : {},
      );

      // Create order items and reserve inventory
      for (const item of orderItems) {
        await OrderItem.create(
          {
            order_id: order.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
          },
          transaction ? { transaction } : {},
        );

        // Reserve inventory
        const inventory = await Inventory.findOne({
          where: { variant_id: item.variant_id },
        });

        if (inventory) {
          await inventory.increment(
            "quantity_reserved",
            { by: item.quantity },
            transaction ? { transaction } : {},
          );
        }
      }

      loggerService.log(`Created order ${order.id} for user ${user_id}`, {
        total_price,
        items: orderItems.length,
      });

      // Send confirmation email (non-blocking)
      (async () => {
        try {
          const user = await User.findByPk(user_id);
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
      loggerService.error(`Error creating order for user ${user_id}`, error);
      throw new AppError("Failed to create order", 500);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(order_id, user_id = null) {
    try {
      const where = { id: order_id };
      if (user_id) where.user_id = user_id;

      const order = await Order.findOne({
        where,
        include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      loggerService.log(`Retrieved order ${order_id}`);
      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting order ${order_id}`, error);
      throw new AppError("Failed to fetch order", 500);
    }
  }

  /**
   * Get user's orders with pagination
   */
  async getUserOrders(user_id, page = 1, limit = 10) {
    try {
      const { offset } = getPaginationParams({ page, limit });

      const { count, rows } = await Order.findAndCountAll({
        where: { user_id },
        include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      const pagination = getPaginationMeta(page, limit, count);

      loggerService.log(`Retrieved ${rows.length} orders for user ${user_id}`, {
        page,
        limit,
        total: count,
      });
      return { rows, pagination, count };
    } catch (error) {
      loggerService.error(`Error getting orders for user ${user_id}`, error);
      throw new AppError("Failed to fetch orders", 500);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(order_id, status, user_id = null) {
    try {
      const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid order status", 400);
      }

      const where = { id: order_id };
      if (user_id) where.user_id = user_id;

      const order = await Order.findOne({ where });
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      // If cancelling, release reserved inventory
      if (status === "cancelled" && order.status !== "cancelled") {
        const orderItems = await OrderItem.findAll({ where: { order_id } });

        for (const item of orderItems) {
          const inventory = await Inventory.findOne({
            where: { variant_id: item.variant_id },
          });

          if (inventory && inventory.quantity_reserved >= item.quantity) {
            await inventory.decrement("quantity_reserved", {
              by: item.quantity,
            });
          }
        }
      }

      await order.update({ status });
      loggerService.log(`Updated order ${order_id} status to ${status}`);

      // Send status update email (non-blocking)
      (async () => {
        try {
          const user = await User.findByPk(order.user_id);
          const fullOrder = await this.getOrderById(order_id);
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
      loggerService.error(`Error updating order ${order_id}`, error);
      throw new AppError("Failed to update order", 500);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(order_id, payment_status, user_id = null) {
    try {
      const validPaymentStatuses = [
        "pending",
        "completed",
        "failed",
        "refunded",
      ];
      if (!validPaymentStatuses.includes(payment_status)) {
        throw new AppError("Invalid payment status", 400);
      }

      const where = { id: order_id };
      if (user_id) where.user_id = user_id;

      const order = await Order.findOne({ where });
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      // If payment completed, confirm inventory
      if (
        payment_status === "completed" &&
        order.payment_status !== "completed"
      ) {
        const orderItems = await OrderItem.findAll({ where: { order_id } });

        for (const item of orderItems) {
          const inventory = await Inventory.findOne({
            where: { variant_id: item.variant_id },
          });

          if (inventory) {
            await inventory.decrement("quantity_available", {
              by: item.quantity,
            });
            await inventory.decrement("quantity_reserved", {
              by: item.quantity,
            });
          }
        }
      }

      await order.update({ payment_status });
      loggerService.log(
        `Updated order ${order_id} payment status to ${payment_status}`,
      );

      // Send payment confirmation email if payment completed (non-blocking)
      if (payment_status === "completed") {
        (async () => {
          try {
            const user = await User.findByPk(order.user_id);
            const fullOrder = await this.getOrderById(order_id);
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
      loggerService.error(
        `Error updating payment for order ${order_id}`,
        error,
      );
      throw new AppError("Failed to update payment status", 500);
    }
  }

  /**
   * Get all orders (admin only)
   */
  /**
   * Get all orders (admin) with pagination and filtering
   */
  async getAllOrders(page = 1, limit = 10, filters = {}) {
    try {
      const { offset } = getPaginationParams({ page, limit });

      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.payment_status) where.payment_status = filters.payment_status;

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{ model: OrderItem, include: [{ model: ProductVariant }] }],
        limit,
        offset,
        order: [["created_at", "DESC"]],
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
  async createOrderFromCart(user_id, orderData, transaction = null) {
    try {
      // Get user's cart
      const cart = await Cart.findOne({
        where: { user_id },
        include: [{ model: CartItem }],
      });

      if (!cart || cart.CartItems.length === 0) {
        throw new AppError("Cart is empty", 400);
      }

      // Convert cart items to products format
      const products = cart.CartItems.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      }));

      // Create order
      const order = await this.createOrder(
        user_id,
        { ...orderData, products },
        transaction,
      );

      // Clear cart after successful order
      await CartItem.destroy({ where: { cart_id: cart.id } });

      loggerService.log(`Created order from cart for user ${user_id}`);
      return order;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error creating order from cart for user ${user_id}`,
        error,
      );
      throw new AppError("Failed to create order from cart", 500);
    }
  }
}

export default new OrderService();
