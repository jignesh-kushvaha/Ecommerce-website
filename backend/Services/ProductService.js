import Product from "../Models/Product.js";
import Category from "../Models/Category.js";
import ProductVariant from "../Models/ProductVariant.js";
import Inventory from "../Models/Inventory.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../Utils/performanceHelper.js";
import { Op } from "sequelize";

class ProductService {
  /**
   * Get all products with optional filtering and pagination
   */
  async getAllProducts(filters = {}) {
    try {
      const {
        category_id = null,
        is_active = true,
        page = 1,
        limit = 12,
        search = null,
        sort = "-createdAt",
      } = filters;

      const { offset } = getPaginationParams({ page, limit });

      const whereClause = { is_active };
      if (category_id) whereClause.category_id = category_id;
      if (search) whereClause.name = { [Op.iLike]: `%${search}%` };

      // Parse sort parameter (e.g., "price", "-price", "name", "-name")
      let orderClause = [["created_at", "DESC"]]; // Default
      if (sort) {
        const isDesc = sort.startsWith("-");
        const field = isDesc ? sort.substring(1) : sort;
        const direction = isDesc ? "DESC" : "ASC";

        // Map sort fields to database columns
        const sortMap = {
          price: "base_price",
          name: "name",
          createdAt: "created_at",
          updatedAt: "updated_at",
          stock: "stock",
        };

        const dbField = sortMap[field] || "created_at";
        orderClause = [[dbField, direction]];
      }

      const { count, rows } = await Product.findAndCountAll({
        where: whereClause,
        distinct: true,
        include: [
          {
            model: ProductVariant,
            include: [{ model: Inventory }],
          },
          { model: Category },
        ],
        limit,
        offset,
        order: orderClause,
      });

      const pagination = getPaginationMeta(page, limit, count);

      loggerService.log(`Retrieved ${rows.length} products`, {
        page,
        limit,
        total: count,
        sort,
      });
      return { rows, pagination, count };
    } catch (error) {
      loggerService.error("Error getting products", error);
      throw new AppError("Failed to fetch products", 500);
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(product_id) {
    try {
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: ProductVariant,
            include: [{ model: Inventory }],
          },
          { model: Category },
        ],
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      loggerService.log(`Retrieved product ${product_id}`);
      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting product ${product_id}`, error);
      throw new AppError("Failed to fetch product", 500);
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    try {
      const { name, slug, base_price, category_id, description, is_active } =
        productData;

      // Validate category exists
      const category = await Category.findByPk(category_id);
      if (!category) {
        throw new AppError("Category not found", 404);
      }

      const product = await Product.create({
        name,
        slug,
        base_price,
        category_id,
        description,
        is_active: is_active !== false,
      });

      loggerService.log(`Created product ${product.id}`, { name });
      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error("Error creating product", error);
      throw new AppError("Failed to create product", 500);
    }
  }

  /**
   * Update product
   */
  async updateProduct(product_id, updateData) {
    try {
      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // If category_id is being changed, validate it exists
      if (
        updateData.category_id &&
        updateData.category_id !== product.category_id
      ) {
        const category = await Category.findByPk(updateData.category_id);
        if (!category) {
          throw new AppError("Category not found", 404);
        }
      }

      await product.update(updateData);
      loggerService.log(`Updated product ${product_id}`, updateData);
      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating product ${product_id}`, error);
      throw new AppError("Failed to update product", 500);
    }
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(product_id) {
    try {
      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      await product.update({ is_active: false });
      loggerService.log(`Soft deleted product ${product_id}`);
      return { success: true, message: "Product deleted" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error deleting product ${product_id}`, error);
      throw new AppError("Failed to delete product", 500);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category_id, limit = 10, offset = 0) {
    try {
      const products = await Product.findAndCountAll({
        where: { category_id, is_active: true },
        include: [
          {
            model: ProductVariant,
            include: [{ model: Inventory }],
          },
        ],
        limit,
        offset,
      });

      loggerService.log(
        `Retrieved ${products.count} products for category ${category_id}`,
      );
      return products;
    } catch (error) {
      loggerService.error(
        `Error getting products for category ${category_id}`,
        error,
      );
      throw new AppError("Failed to fetch products", 500);
    }
  }

  /**
   * Search products
   */
  async searchProducts(query, limit = 10, offset = 0) {
    try {
      const products = await Product.findAndCountAll({
        where: {
          is_active: true,
          [sequelize.Op.or]: [
            { name: { [sequelize.Op.iLike]: `%${query}%` } },
            { description: { [sequelize.Op.iLike]: `%${query}%` } },
          ],
        },
        include: [
          {
            model: ProductVariant,
            include: [{ model: Inventory }],
          },
          { model: Category },
        ],
        limit,
        offset,
      });

      loggerService.log(
        `Search for "${query}" returned ${products.count} results`,
      );
      return products;
    } catch (error) {
      loggerService.error(`Error searching products for "${query}"`, error);
      throw new AppError("Failed to search products", 500);
    }
  }
}

export default new ProductService();
