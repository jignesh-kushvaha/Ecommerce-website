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
  User.hasMany(Order, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasOne(Cart, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(AuditLog, { foreignKey: "changed_by", as: "auditLogs" });

  // Category associations
  Category.hasMany(Product, { foreignKey: "category_id", onDelete: "CASCADE" });

  // Product associations
  Product.belongsTo(Category, { foreignKey: "category_id" });
  Product.hasMany(ProductVariant, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  // ProductVariant associations
  ProductVariant.belongsTo(Product, { foreignKey: "product_id" });
  ProductVariant.hasOne(Inventory, {
    foreignKey: "variant_id",
    onDelete: "CASCADE",
  });
  ProductVariant.hasMany(OrderItem, { foreignKey: "variant_id" });
  ProductVariant.hasMany(CartItem, {
    foreignKey: "variant_id",
    onDelete: "CASCADE",
  });

  // Inventory associations
  Inventory.belongsTo(ProductVariant, { foreignKey: "variant_id" });

  // Order associations
  Order.belongsTo(User, { foreignKey: "user_id" });
  Order.hasMany(OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: "order_id" });
  OrderItem.belongsTo(ProductVariant, { foreignKey: "variant_id" });

  // Cart associations
  Cart.belongsTo(User, { foreignKey: "user_id" });
  Cart.hasMany(CartItem, { foreignKey: "cart_id", onDelete: "CASCADE" });

  // CartItem associations
  CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
  CartItem.belongsTo(ProductVariant, { foreignKey: "variant_id" });

  // AuditLog associations
  AuditLog.belongsTo(User, { foreignKey: "changed_by", as: "changedByUser" });

  // RefreshToken associations
  RefreshToken.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" });
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
