import {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../Constants/httpStatusCode.js";
import { ORDER_PLACED, ORDER_UPDATED } from "../Constants/responseMessage.js";
import { catchAsync } from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";
import OrderService from "../Services/OrderService.js";
import CartService from "../Services/CartService.js";
import { withTransaction } from "../Utils/transaction.js";

export const getOrderDetails = catchAsync(async (req, res, next) => {
  try {
    const order = await OrderService.getOrderById(req.params.id, req.user.id);

    res.status(OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error(`Error getting order details ${req.params.id}`, error);
    return next(new AppError("Failed to fetch order", INTERNAL_SERVER_ERROR));
  }
});

export const placeOrder = catchAsync(async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      throw new AppError("Missing required order information", BAD_REQUEST);
    }

    // Create order within transaction
    const order = await withTransaction(async (transaction) => {
      return await OrderService.createOrderFromCart(
        userId,
        { shippingAddress, paymentMethod },
        transaction,
      );
    });

    loggerService.log(`Order placed by user ${userId}`, {
      orderId: order.id,
    });

    res.status(CREATED).json({
      success: true,
      message: ORDER_PLACED || "Order placed successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error(`Error placing order for user ${req.user.id}`, error);
    return next(new AppError("Failed to place order", INTERNAL_SERVER_ERROR));
  }
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
      throw new AppError("Status is required", BAD_REQUEST);
    }

    const order = await OrderService.updateOrderStatus(orderId, status);

    res.status(OK).json({
      success: true,
      message: ORDER_UPDATED || "Order updated successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error(`Error updating order ${req.params.id}`, error);
    return next(new AppError("Failed to update order", INTERNAL_SERVER_ERROR));
  }
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.paymentStatus)
      filters.paymentStatus = req.query.paymentStatus;

    // If user is not admin, only return their orders
    let result;
    if (req.user.userType !== "admin") {
      result = await OrderService.getUserOrders(req.user.id, limit, offset);
    } else {
      result = await OrderService.getAllOrders(limit, offset, filters);
    }

    res.status(OK).json({
      success: true,
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit),
      data: result.rows,
    });
  } catch (error) {
    loggerService.error("Error getting orders", error);
    return next(new AppError("Failed to fetch orders", INTERNAL_SERVER_ERROR));
  }
});
