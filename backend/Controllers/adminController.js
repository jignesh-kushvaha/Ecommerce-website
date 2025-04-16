import { NOT_FOUND, OK } from "../Constants/httpStatusCode.js";
import User from "../Models/userModel.js";
import Order from "../Models/orderModel.js";
import Product from "../Models/productModel.js";
import { catchAsync } from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";

// Get all users (admin only)
export const getAllUsers = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Query params
  const { name, email, userType } = req.query;
  let filter = {};

  // Apply filters if provided
  if (name) filter.name = { $regex: name, $options: "i" };
  if (email) filter.email = { $regex: email, $options: "i" };
  if (userType) filter.userType = userType;

  // Execute query
  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.status(OK).json({
    success: true,
    results: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
});

// Get user by ID (admin only)
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return next(new AppError("User not found", NOT_FOUND));
  }

  res.status(OK).json({
    success: true,
    data: user,
  });
});

// Get all orders (admin only)
export const getAllOrders = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Query params
  const { status, startDate, endDate, userId } = req.query;
  let filter = {};

  // Apply filters if provided
  if (status) filter.status = status;
  if (userId) filter.userId = userId;

  // Add date range filter if provided
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Execute query
  const orders = await Order.find(filter)
    .populate({
      path: "products.productId",
      select: "name price image category description",
    })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(OK).json({
    success: true,
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: orders,
  });
});

// Get admin dashboard statistics
export const getDashboardStats = catchAsync(async (req, res) => {
  // Get total counts
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalCustomers = await User.countDocuments({ userType: "customer" });

  // Get order status counts
  const pendingOrders = await Order.countDocuments({ status: "Pending" });
  const processingOrders = await Order.countDocuments({ status: "Processing" });
  const shippedOrders = await Order.countDocuments({ status: "Shipped" });
  const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
  const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

  // Calculate total revenue
  const orders = await Order.find();
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  // Get recent orders
  const recentOrders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  // Get products with low stock
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
    .sort({ stock: 1 })
    .limit(5);

  // Get top rated products
  const topRatedProducts = await Product.find()
    .sort({ avgRating: -1 })
    .limit(5);

  res.status(OK).json({
    success: true,
    data: {
      counts: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
      },
      orderStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      recentOrders,
      lowStockProducts,
      topRatedProducts,
    },
  });
});
