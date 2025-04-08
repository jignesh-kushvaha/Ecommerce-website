import {
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  OK,
} from "../Constants/httpStatusCode.js";
import { ORDER_PLACED, ORDER_UPDATED } from "../Constants/responseMessage.js";
import Order from "../Models/orderModel.js";
import Product from "../Models/productModel.js";
import { catchAsync } from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";

export const getOrderDetails = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: "products.productId",
      select: "name price image category description",
    })
    .populate("userId", "name email");

  if (!order) {
    return next(new AppError("Order not found", NOT_FOUND));
  }

  // Format the data for frontend display
  const formattedOrder = {
    ...order.toObject(),
    products: order.products.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.productId ? item.productId.price : 0,
      subtotal: item.productId ? item.productId.price * item.quantity : 0,
    })),
  };

  res.status(OK).json({
    success: true,
    data: formattedOrder,
  });
});

export const placeOrder = catchAsync(async (req, res, next) => {
  const { products, shippingAddress, paymentMethod, paymentDetails } = req.body;
  const user = req.user;

  if (!products || !shippingAddress || !paymentMethod) {
    return next(
      new AppError("Missing required order information", BAD_REQUEST)
    );
  }

  let totalPrice = 0;
  const orderProducts = [];

  // Validate products and calculate total price
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(
        new AppError(`Product not found: ${item.productId}`, NOT_FOUND)
      );
    }
    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
          BAD_REQUEST
        )
      );
    }

    const subtotal = product.price * item.quantity;
    totalPrice += subtotal;

    orderProducts.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      name: product.name,
      subtotal: subtotal,
    });
  }

  // Create the order
  const order = await Order.create({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    products: orderProducts,
    shippingAddress,
    paymentMethod,
    paymentDetails: paymentMethod === "creditCard" ? paymentDetails : undefined,
    totalPrice,
  });

  // Update product stock
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  res.status(CREATED).json({
    success: true,
    message: ORDER_PLACED,
    data: order,
  });
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", NOT_FOUND));
  }

  // Validate status transition
  const validTransitions = {
    Pending: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    return next(
      new AppError(
        `Invalid status transition from ${order.status} to ${status}`,
        BAD_REQUEST
      )
    );
  }

  order.status = status;
  await order.save();

  res.status(OK).json({
    success: true,
    message: ORDER_UPDATED,
    data: order,
  });
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = { userId: req.user._id }; // Only get orders for the current user

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query the database
    const orders = await Order.find(filter)
      .populate({
        path: "products.productId",
        select: "name price image category description",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!orders) {
      return next(new AppError("No orders found", NOT_FOUND));
    }

    const total = await Order.countDocuments(filter);

    res.status(OK).json({
      success: true,
      results: orders.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    next(new AppError(error.message, BAD_REQUEST));
  }
});
