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
  async getOrCreateCart(userId) {
    try {
      let cart = await Cart.findOne({ where: { userId } });

      if (!cart) {
        cart = await Cart.create({ userId });
        loggerService.log(`Created new cart for user ${userId}`);
      } else {
        loggerService.debug(`Retrieved cart for user ${userId}`);
      }

      return cart;
    } catch (error) {
      loggerService.error(
        `Error getting/creating cart for user ${userId}`,
        error,
      );
      throw new AppError("Failed to access cart", 500);
    }
  }

  /**
   * Get cart with items
   */
  async getCart(userId) {
    try {
      const cart = await Cart.findOne({
        where: { userId },
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

      loggerService.log(`Retrieved cart for user ${userId}`);
      return cart;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting cart for user ${userId}`, error);
      throw new AppError("Failed to fetch cart", 500);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(userId, variantId, quantity) {
    try {
      // Validate variant exists and has stock
      const variant = await ProductVariant.findByPk(variantId);
      if (!variant) {
        throw new AppError("Product variant not found", 404);
      }

      // Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // Check if item already in cart
      let cartItem = await CartItem.findOne({
        where: { cartId: cart.id, variantId },
      });

      if (cartItem) {
        // Update quantity
        cartItem.quantity += quantity;
        await cartItem.save();
        loggerService.log(
          `Updated cart item for user ${userId}: quantity = ${cartItem.quantity}`,
        );
      } else {
        // Create new cart item
        cartItem = await CartItem.create({
          cartId: cart.id,
          variantId,
          quantity,
        });
        loggerService.log(
          `Added item to cart for user ${userId}: variant ${variantId}, qty ${quantity}`,
        );
      }

      return cartItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error adding to cart for user ${userId}`, error);
      throw new AppError("Failed to add to cart", 500);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId, cartItemId) {
    try {
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      const cartItem = await CartItem.findOne({
        where: { id: cartItemId, cartId: cart.id },
      });

      if (!cartItem) {
        throw new AppError("Cart item not found", 404);
      }

      await cartItem.destroy();
      loggerService.log(
        `Removed item ${cartItemId} from cart for user ${userId}`,
      );
      return { success: true, message: "Item removed from cart" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error removing from cart for user ${userId}`, error);
      throw new AppError("Failed to remove from cart", 500);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(userId, cartItemId, quantity) {
    try {
      if (quantity <= 0) {
        throw new AppError("Quantity must be greater than 0", 400);
      }

      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      const cartItem = await CartItem.findOne({
        where: { id: cartItemId, cartId: cart.id },
      });

      if (!cartItem) {
        throw new AppError("Cart item not found", 404);
      }

      cartItem.quantity = quantity;
      await cartItem.save();
      loggerService.log(
        `Updated cart item ${cartItemId} quantity to ${quantity}`,
      );
      return cartItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error updating cart item quantity for user ${userId}`,
        error,
      );
      throw new AppError("Failed to update cart item", 500);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        throw new AppError("Cart not found", 404);
      }

      await CartItem.destroy({ where: { cartId: cart.id } });
      loggerService.log(`Cleared cart for user ${userId}`);
      return { success: true, message: "Cart cleared" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error clearing cart for user ${userId}`, error);
      throw new AppError("Failed to clear cart", 500);
    }
  }

  /**
   * Get cart total price
   */
  async getCartTotal(userId) {
    try {
      const cart = await Cart.findOne({
        where: { userId },
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
        `Cart total for user ${userId}: $${total}, items: ${itemCount}`,
      );
      return { total, itemCount, items: cart.CartItems };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error calculating cart total for user ${userId}`,
        error,
      );
      throw new AppError("Failed to calculate cart total", 500);
    }
  }

  /**
   * Validate cart items have stock
   */
  async validateCartStock(userId) {
    try {
      const cart = await Cart.findOne({
        where: { userId },
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
          where: { variantId: cartItem.variantId },
        });

        const available = inventory
          ? inventory.quantityAvailable - inventory.quantityReserved
          : 0;

        if (available < cartItem.quantity) {
          invalidItems.push({
            variantId: cartItem.variantId,
            requested: cartItem.quantity,
            available,
          });
        }
      }

      if (invalidItems.length > 0) {
        throw new AppError("Some items are out of stock", 400);
      }

      loggerService.log(`Cart validated for user ${userId}`);
      return { success: true, message: "Cart has valid stock" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error validating cart for user ${userId}`, error);
      throw new AppError("Failed to validate cart", 500);
    }
  }

  /**
   * Merge guest cart items with user's existing cart
   * Called when user logs in with items in localStorage
   */
  async mergeGuestCart(userId, guestCartItems = []) {
    try {
      // Get or create user's cart
      let cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        cart = await Cart.create({ userId });
        loggerService.log(`Created new cart for user ${userId} during merge`);
      }

      const mergedItems = [];

      for (const guestItem of guestCartItems) {
        const { variantId, quantity } = guestItem;

        if (!variantId || !quantity || quantity <= 0) {
          loggerService.warn(
            `Skipped invalid guest cart item for user ${userId}`,
          );
          continue;
        }

        // Check if variant exists
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
          loggerService.warn(
            `Variant ${variantId} not found during guest cart merge for user ${userId}`,
          );
          continue;
        }

        // Check if item already in user's cart
        let existingItem = await CartItem.findOne({
          where: { cartId: cart.id, variantId },
        });

        if (existingItem) {
          // Add guest quantity to existing quantity
          existingItem.quantity += quantity;
          await existingItem.save();
          loggerService.log(
            `Updated existing cart item ${variantId} for user ${userId}`,
          );
        } else {
          // Create new cart item
          await CartItem.create({
            cartId: cart.id,
            variantId,
            quantity,
          });
          loggerService.log(
            `Added guest cart item ${variantId} to user ${userId} cart`,
          );
        }

        mergedItems.push({
          variantId,
          quantity,
        });
      }

      // Get updated cart
      const updatedCart = await this.getCart(userId);

      loggerService.log(
        `Merged ${mergedItems.length} guest cart items for user ${userId}`,
      );

      return {
        success: true,
        message: `Merged ${mergedItems.length} items from guest cart`,
        cart: updatedCart,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error merging guest cart for user ${userId}`, error);
      throw new AppError("Failed to merge guest cart", 500);
    }
  }
}

export default new CartService();
