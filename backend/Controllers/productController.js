import { catchAsync } from "../Utils/catchAsync.js";
import ProductService from "../Services/ProductService.js";
import loggerService from "../Utils/logger.js";
import AppError from "../Utils/appError.js";
import * as statusCode from "../Constants/httpStatusCode.js";
import * as message from "../Constants/responseMessage.js";

export const getOneProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.status(statusCode.OK).json({ success: true, data: product });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error(`Error getting product ${req.params.id}`, error);
    return next(
      new AppError("Failed to fetch product", statusCode.INTERNAL_SERVER_ERROR),
    );
  }
});

export const getProduct = catchAsync(async (req, res, next) => {
  try {
    // Parse pagination and filtering
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const filters = {
      categoryId: req.query.categoryId || null,
      isActive: req.query.isActive !== "false",
      limit,
      offset,
      search: req.query.search || null,
      sort: req.query.sort || "-createdAt", // Default sort by newest first
    };

    const result = await ProductService.getAllProducts(filters);

    res.status(statusCode.OK).json({
      success: true,
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit),
      data: result.rows,
    });
  } catch (error) {
    loggerService.error("Error fetching products", error);
    return next(
      new AppError(
        "Failed to fetch products",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const createProduct = catchAsync(async (req, res, next) => {
  try {
    const { name, slug, basePrice, categoryId, description, isActive } =
      req.body;

    const productData = {
      name,
      slug,
      basePrice: parseFloat(basePrice),
      categoryId: parseInt(categoryId),
      description,
      isActive,
    };

    const product = await ProductService.createProduct(productData);

    res.status(statusCode.CREATED).json({
      success: true,
      message: message.PRODUCT_ADDED || "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error("Error creating product", error);
    return next(
      new AppError(
        "Failed to create product",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const updateProduct = catchAsync(async (req, res, next) => {
  try {
    const product_id = req.params.id;
    const updateData = { ...req.body };

    // Type conversions
    if (updateData.basePrice) {
      updateData.basePrice = parseFloat(updateData.basePrice);
    }
    if (updateData.categoryId) {
      updateData.categoryId = parseInt(updateData.categoryId);
    }

    const product = await ProductService.updateProduct(product_id, updateData);

    res.status(statusCode.OK).json({
      success: true,
      message: message.PRODUCT_UPDATED || "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error(`Error updating product ${req.params.id}`, error);
    return next(
      new AppError(
        "Failed to update product",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);

    res.status(statusCode.OK).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    loggerService.error(`Error deleting product ${req.params.id}`, error);
    return next(
      new AppError(
        "Failed to delete product",
        statusCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

export const addReview = catchAsync(async (req, res, next) => {
  try {
    // Placeholder for future review implementation
    loggerService.log("Review endpoint called (not yet implemented)");
    res.status(statusCode.OK).json({
      success: true,
      message: "Review feature coming soon",
    });
  } catch (error) {
    loggerService.error("Error adding review", error);
    return next(
      new AppError("Failed to add review", statusCode.INTERNAL_SERVER_ERROR),
    );
  }
});
