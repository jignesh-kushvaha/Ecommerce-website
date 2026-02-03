import { catchAsync } from "../Utils/catchAsync.js";
import CartService from "../Services/CartService.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";
import * as statusCode from "../Constants/httpStatusCode.js";

export const getCart = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const cart = await CartService.getCart(user_id);

    res.status(statusCode.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error fetching cart", error);
    return next(
      new AppError("Failed to fetch cart", statusCode.INTERNAL_SERVER_ERROR),
    );
  }
});

export const addToCart = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { variant_id, quantity } = req.body;

    if (!variant_id || !quantity || quantity <= 0) {
      return next(
        new AppError("Invalid variant_id or quantity", statusCode.BAD_REQUEST),
      );
    }

    const cartItem = await CartService.addToCart(user_id, variant_id, quantity);

    res.status(statusCode.CREATED).json({
      success: true,
      message: "Item added to cart",
      data: cartItem,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error adding to cart", error);
    return next(
      new AppError("Failed to add to cart", statusCode.INTERNAL_SERVER_ERROR),
    );
  }
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { cart_item_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return next(new AppError("Invalid quantity", statusCode.BAD_REQUEST));
    }

    await CartService.updateCartItemQuantity(user_id, cart_item_id, quantity);

    const cart = await CartService.getCart(user_id);

    res.status(statusCode.OK).json({
      success: true,
      message: "Cart item updated",
      data: cart,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error updating cart item", error);
    return next(
      new AppError(
        "Failed to update cart item",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { cart_item_id } = req.params;

    await CartService.removeFromCart(user_id, cart_item_id);

    const cart = await CartService.getCart(user_id);

    res.status(statusCode.OK).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error removing from cart", error);
    return next(
      new AppError(
        "Failed to remove from cart",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const clearCart = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;

    await CartService.clearCart(user_id);

    res.status(statusCode.OK).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error clearing cart", error);
    return next(
      new AppError("Failed to clear cart", statusCode.INTERNAL_SERVER_ERROR),
    );
  }
});

export const validateCart = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await CartService.validateCart(user_id);

    res.status(statusCode.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error validating cart", error);
    return next(
      new AppError("Failed to validate cart", statusCode.INTERNAL_SERVER_ERROR),
    );
  }
});

export const mergeGuestCart = catchAsync(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { guestCartItems } = req.body;

    if (!Array.isArray(guestCartItems)) {
      return next(
        new AppError("guestCartItems must be an array", statusCode.BAD_REQUEST),
      );
    }

    const result = await CartService.mergeGuestCart(user_id, guestCartItems);

    res.status(statusCode.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error merging guest cart", error);
    return next(
      new AppError(
        "Failed to merge guest cart",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});
