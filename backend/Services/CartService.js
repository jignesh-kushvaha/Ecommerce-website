import Cart from "../Models/Cart.js";
import CartItem from "../Models/CartItem.js";
import ProductVariant from "../Models/ProductVariant.js";
import Inventory from "../Models/Inventory.js";

import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

class CartService {
  /**
   * Get or create cart for user
   */
  async getOrCreateCart(user_id) {
    try {
      let cart = await Cart.findOne({ where: { user_id } });

      if (!cart) {
        cart = await Cart.create({ user_id });
        loggerService.log(`Created new cart for user ${user_id}`);
      } else {
        loggerService.debug(`Retrieved cart for user ${user_id}`);
      }

      return cart;
    } catch (error) {
      loggerService.error(
        `Error getting/creating cart for user ${user_id}`,
        error,
      );
      throw new AppError("Failed to access cart", 500);
    }
  }

  /**
   * Get cart with items
   */
  async getCart(user_id) {
    try {
      const cart = await Cart.findOne({
        where: { user_id },
        include: [
          {
            model: CartItem,
            include: [{ model: ProductVariant }],
          },
        ],
      });

      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      loggerService.log(`Retrieved cart for user ${user_id}`);
      return cart;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting cart for user ${user_id}`, error);
      throw new AppError("Failed to fetch cart", 500);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(user_id, variant_id, quantity) {
    try {
      // Validate variant exists and has stock
      const variant = await ProductVariant.findByPk(variant_id);
      if (!variant) {
        throw new AppError("Product variant not found", 404);
      }

      // Get or create cart
      const cart = await this.getOrCreateCart(user_id);

      // Check if item already in cart
      let cartItem = await CartItem.findOne({
        where: { cart_id: cart.id, variant_id },
      });

      if (cartItem) {
        // Update quantity
        cartItem.quantity += quantity;
        await cartItem.save();
        loggerService.log(
          `Updated cart item for user ${user_id}: quantity = ${cartItem.quantity}`,
        );
      } else {
        // Create new cart item
        cartItem = await CartItem.create({
          cart_id: cart.id,
          variant_id,
          quantity,
        });
        loggerService.log(
          `Added item to cart for user ${user_id}: variant ${variant_id}, qty ${quantity}`,
        );
      }

      return cartItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error adding to cart for user ${user_id}`, error);
      throw new AppError("Failed to add to cart", 500);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(user_id, cart_item_id) {
    try {
      const cart = await Cart.findOne({ where: { user_id } });
      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      const cartItem = await CartItem.findOne({
        where: { id: cart_item_id, cart_id: cart.id },
      });

      if (!cartItem) {
        throw new AppError("Cart item not found", 404);
      }

      await cartItem.destroy();
      loggerService.log(
        `Removed item ${cart_item_id} from cart for user ${user_id}`,
      );
      return { success: true, message: "Item removed from cart" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error removing from cart for user ${user_id}`,
        error,
      );
      throw new AppError("Failed to remove from cart", 500);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(user_id, cart_item_id, quantity) {
    try {
      if (quantity <= 0) {
        throw new AppError("Quantity must be greater than 0", 400);
      }

      const cart = await Cart.findOne({ where: { user_id } });
      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      const cartItem = await CartItem.findOne({
        where: { id: cart_item_id, cart_id: cart.id },
      });

      if (!cartItem) {
        throw new AppError("Cart item not found", 404);
      }

      cartItem.quantity = quantity;
      await cartItem.save();
      loggerService.log(
        `Updated cart item ${cart_item_id} quantity to ${quantity}`,
      );
      return cartItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error updating cart item quantity for user ${user_id}`,
        error,
      );
      throw new AppError("Failed to update cart item", 500);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(user_id) {
    try {
      const cart = await Cart.findOne({ where: { user_id } });
      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      await CartItem.destroy({ where: { cart_id: cart.id } });
      loggerService.log(`Cleared cart for user ${user_id}`);
      return { success: true, message: "Cart cleared" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error clearing cart for user ${user_id}`, error);
      throw new AppError("Failed to clear cart", 500);
    }
  }

  /**
   * Get cart total price
   */
  async getCartTotal(user_id) {
    try {
      const cart = await Cart.findOne({
        where: { user_id },
        include: [
          {
            model: CartItem,
            include: [{ model: ProductVariant }],
          },
        ],
      });

      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      let total = 0;
      let itemCount = 0;

      cart.CartItems.forEach((item) => {
        total += item.ProductVariant.price * item.quantity;
        itemCount += item.quantity;
      });

      loggerService.log(
        `Cart total for user ${user_id}: $${total}, items: ${itemCount}`,
      );
      return { total, itemCount, items: cart.CartItems };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error calculating cart total for user ${user_id}`,
        error,
      );
      throw new AppError("Failed to calculate cart total", 500);
    }
  }

  /**
   * Validate cart items have stock
   */
  async validateCartStock(user_id) {
    try {
      const cart = await Cart.findOne({
        where: { user_id },
        include: [
          {
            model: CartItem,
            include: [{ model: ProductVariant }],
          },
        ],
      });

      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      const invalidItems = [];

      for (const cartItem of cart.CartItems) {
        const inventory = await Inventory.findOne({
          where: { variant_id: cartItem.variant_id },
        });

        const available = inventory
          ? inventory.quantity_available - inventory.quantity_reserved
          : 0;

        if (available < cartItem.quantity) {
          invalidItems.push({
            variant_id: cartItem.variant_id,
            requested: cartItem.quantity,
            available,
          });
        }
      }

      if (invalidItems.length > 0) {
        throw new AppError("Some items are out of stock", 400);
      }

      loggerService.log(`Cart validated for user ${user_id}`);
      return { success: true, message: "Cart has valid stock" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error validating cart for user ${user_id}`, error);
      throw new AppError("Failed to validate cart", 500);
    }
  }
}

export default new CartService();
