import { catchAsync } from "../Utils/catchAsync.js";
import Product from "../Models/productModel.js";
import * as statusCode from "../Constants/httpStatusCode.js";
import * as message from "../Constants/responseMessage.js";
import AppError from "../Utils/appError.js";
import Review from "../Models/reviewModel.js";

export const getOneProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return next(new AppError("Product not found", statusCode.NOT_FOUND));
  res.status(statusCode.OK).json({ success: true, data: product });
});

export const getProduct = catchAsync(async (req, res, next) => {
  // Build filter object
  const filter = {};

  // Category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  // Sorting
  let sortBy = {};
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith("-")
      ? req.query.sort.slice(1)
      : req.query.sort;
    const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;
    sortBy[sortField] = sortOrder;
  } else {
    sortBy = { price: -1 };
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(24, Math.max(1, parseInt(req.query.limit) || 8));
  const skip = (page - 1) * limit;

  try {
    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Query the database
    const products = await Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate("reviews");

    // Calculate average rating and format response
    const productsWithRating = products.map((product) => {
      const productObj = product.toObject();
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        productObj.averageRating = totalRating / product.reviews.length;
      }
      return productObj;
    });

    res.status(statusCode.OK).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: productsWithRating,
    });
  } catch (error) {
    return next(
      new AppError(
        `Error fetching products: ${error.message}`,
        statusCode.INTERNAL_SERVER_ERROR
      )
    );
  }
});

export const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  const images = req.files.map((file) => file.filename);

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock: parseInt(stock),
    images,
  });

  if (!product) {
    return next(new AppError("Order not found", statusCode.NOT_FOUND));
  }

  res.status(statusCode.CREATED).json({
    success: true,
    message: message.PRODUCT_ADDED,
    data: product,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };

  // Handle image uploads if files are present
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => file.filename);

    // If there are existing images, combine them with the new ones
    if (req.body.existingImages) {
      // If existingImages is a string (single image), convert to array
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];

      updateData.images = [...existingImages, ...newImages];
    } else {
      // If no existing images, just use the new ones
      updateData.images = newImages;
    }

    // Remove existingImages field as it's not in the schema
    delete updateData.existingImages;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!product) {
    return next(new AppError("Product not found", statusCode.NOT_FOUND));
  }

  res.status(statusCode.OK).json({
    success: true,
    message: message.PRODUCT_UPDATED,
    data: product,
  });
});

export const addReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.create({
    product: req.params.id,
    rating,
    comment,
  });

  await Product.findByIdAndUpdate(req.params.id, {
    $push: { reviews: review._id },
  });

  res.status(statusCode.CREATED).json({
    success: true,
    message: message.REVIEW_ADDED,
    data: review,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", statusCode.NOT_FOUND));
  }

  res.status(statusCode.OK).json({
    success: true,
    message: "Product deleted successfully",
  });
});
