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
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const filters = {
      category_id: req.query.category_id || null,
      is_active: req.query.is_active !== "false",
      limit,
      offset,
      search: req.query.search || null,
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
    const { name, slug, base_price, category_id, description, is_active } =
      req.body;

    const productData = {
      name,
      slug,
      base_price: parseFloat(base_price),
      category_id: parseInt(category_id),
      description,
      is_active,
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
    if (updateData.base_price) {
      updateData.base_price = parseFloat(updateData.base_price);
    }
    if (updateData.category_id) {
      updateData.category_id = parseInt(updateData.category_id);
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
