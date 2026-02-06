import sequelize from "../config/database.js";
import User from "../Models/User.js";
import Category from "../Models/Category.js";
import Product from "../Models/Product.js";
import ProductVariant from "../Models/ProductVariant.js";
import Inventory from "../Models/Inventory.js";
import Order from "../Models/Order.js";
import OrderItem from "../Models/OrderItem.js";
import Cart from "../Models/Cart.js";
import CartItem from "../Models/CartItem.js";
import AuditLog from "../Models/AuditLog.js";
import RefreshToken from "../Models/RefreshToken.js";

// Define associations
export function defineAssociations() {
  // User associations
  User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(AuditLog, { foreignKey: "changedBy", as: "auditLogs" });

  // Category associations
  Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });

  // Product associations
  Product.belongsTo(Category, { foreignKey: "categoryId" });
  Product.hasMany(ProductVariant, {
    foreignKey: "productId",
    onDelete: "CASCADE",
  });

  // ProductVariant associations
  ProductVariant.belongsTo(Product, { foreignKey: "productId" });
  ProductVariant.hasOne(Inventory, {
    foreignKey: "variantId",
    onDelete: "CASCADE",
  });
  ProductVariant.hasMany(OrderItem, { foreignKey: "variantId" });
  ProductVariant.hasMany(CartItem, {
    foreignKey: "variantId",
    onDelete: "CASCADE",
  });

  // Inventory associations
  Inventory.belongsTo(ProductVariant, { foreignKey: "variantId" });

  // Order associations
  Order.belongsTo(User, { foreignKey: "userId" });
  Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });
  OrderItem.belongsTo(ProductVariant, { foreignKey: "variantId" });

  // Cart associations
  Cart.belongsTo(User, { foreignKey: "userId" });
  Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
  // CartItem associations
  CartItem.belongsTo(Cart, { foreignKey: "cartId" });
  CartItem.belongsTo(ProductVariant, { foreignKey: "variantId" });

  // AuditLog associations
  AuditLog.belongsTo(User, { foreignKey: "changedBy", as: "changedByUser" });
  // RefreshToken associations
  RefreshToken.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
}

// Sync database
export async function syncDatabase(force = false) {
  try {
    console.log(`Syncing database (force: ${force})...`);
    defineAssociations();
    await sequelize.sync({ force });
    console.log("✅ Database synced successfully!");
  } catch (error) {
    console.error("❌ Database sync error:", error);
    throw error;
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");
    defineAssociations();
    console.log("Associations defined successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export default sequelize;
