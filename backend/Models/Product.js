import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { createAuditLog } from "../Utils/auditHelper.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    hooks: {
      afterCreate: async (product, options) => {
        await createAuditLog(
          "Product",
          product.id,
          "create",
          null,
          null,
          product.dataValues,
          options.transaction,
        );
      },
      afterUpdate: async (product, options) => {
        const changedFields = product.changed();
        if (changedFields && changedFields.length > 0) {
          const oldValues = {};
          const newValues = {};
          changedFields.forEach((field) => {
            oldValues[field] = product._previousDataValues[field];
            newValues[field] = product.dataValues[field];
          });
          await createAuditLog(
            "Product",
            product.id,
            "update",
            null,
            oldValues,
            newValues,
            options.transaction,
          );
        }
      },
      afterDestroy: async (product, options) => {
        await createAuditLog(
          "Product",
          product.id,
          "delete",
          null,
          product.dataValues,
          null,
          options.transaction,
        );
      },
    },
    indexes: [
      { fields: ["categoryId"] },
      { fields: ["isActive", "categoryId"] },
    ],
  },
);

export default Product;
