import loggerService from "./logger.js";

/**
 * Pagination helper for list endpoints
 */
export function getPaginationParams(query) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100); // Max 100 items
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination metadata
 */
export function getPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
}

/**
 * Eager loading include patterns for models
 */
export const eagerLoadPatterns = {
  // Product eager loads
  productFull: [
    { association: "Category" },
    { association: "ProductVariants", include: ["Inventory"] },
    { association: "Reviews", include: ["User"] },
  ],
  productBasic: [
    { association: "Category" },
    { association: "ProductVariants", include: ["Inventory"] },
  ],
  productList: [{ association: "Category" }],

  // Order eager loads
  orderFull: [
    { association: "User" },
    { association: "OrderItems", include: ["ProductVariant"] },
  ],
  orderBasic: [{ association: "OrderItems", include: ["ProductVariant"] }],

  // User eager loads
  userProfile: [
    { association: "Orders", limit: 10 },
    { association: "Cart", include: ["CartItems"] },
  ],
};

/**
 * Select specific fields from result to reduce JSON payload
 */
export function selectFields(data, fields) {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const result = {};
      fields.forEach((field) => {
        if (typeof field === "string") {
          result[field] = item[field];
        } else if (typeof field === "object") {
          // Support nested field selection
          const [parent, child] = field.nested.split(".");
          result[field.name] = item[parent]?.[child];
        }
      });
      return result;
    });
  } else {
    const result = {};
    fields.forEach((field) => {
      if (typeof field === "string") {
        result[field] = data[field];
      } else if (typeof field === "object") {
        const [parent, child] = field.nested.split(".");
        result[field.name] = data[parent]?.[child];
      }
    });
    return result;
  }
}

/**
 * Cache key generator
 */
export function generateCacheKey(prefix, ...args) {
  return `${prefix}:${args.join(":")}`;
}

/**
 * Get HTTP cache headers
 */
export function getCacheHeaders(maxAge = 3600) {
  return {
    "Cache-Control": `public, max-age=${maxAge}`,
  };
}

/**
 * Query optimization helper
 */
export class QueryOptimizer {
  static formatSearchQuery(searchTerm) {
    // Remove special characters and trim
    return searchTerm
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "");
  }

  static buildFilterWhere(filters = {}) {
    const where = {};

    // Common filters
    if (filters.status) where.status = filters.status;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.user_type) where.user_type = filters.user_type;

    // Date range filters
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter)
        where.createdAt.$gte = new Date(filters.createdAfter);
      if (filters.createdBefore)
        where.createdAt.$lte = new Date(filters.createdBefore);
    }

    // Price range filters
    if (filters.minPrice || filters.maxPrice) {
      where.base_price = {};
      if (filters.minPrice)
        where.base_price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice)
        where.base_price.$lte = parseFloat(filters.maxPrice);
    }

    return where;
  }
}

export default {
  getPaginationParams,
  getPaginationMeta,
  eagerLoadPatterns,
  selectFields,
  generateCacheKey,
  getCacheHeaders,
  QueryOptimizer,
};
