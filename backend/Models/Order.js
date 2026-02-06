import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { v4 as uuidv4 } from "uuid";
import { createAuditLog } from "../Utils/auditHelper.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer"),
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    idempotencyKey: {
      type: DataTypes.UUID,
      unique: true,
      defaultValue: () => uuidv4(),
    },
    shippingName: {
      type: DataTypes.STRING(255),
    },
    shippingEmail: {
      type: DataTypes.STRING(255),
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
    },
    shippingStreet: {
      type: DataTypes.STRING(255),
    },
    shippingCity: {
      type: DataTypes.STRING(100),
    },
    shippingState: {
      type: DataTypes.STRING(100),
    },
    shippingCountry: {
      type: DataTypes.STRING(100),
    },
    shippingPostalCode: {
      type: DataTypes.STRING(20),
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    hooks: {
      afterCreate: async (order, options) => {
        await createAuditLog(
          "Order",
          order.id,
          "create",
          null,
          null,
          order.dataValues,
          options.transaction,
        );
      },
      afterUpdate: async (order, options) => {
        const changedFields = order.changed();
        if (changedFields && changedFields.length > 0) {
          const oldValues = {};
          const newValues = {};
          changedFields.forEach((field) => {
            oldValues[field] = order._previousDataValues[field];
            newValues[field] = order.dataValues[field];
          });
          await createAuditLog(
            "Order",
            order.id,
            "update",
            null,
            oldValues,
            newValues,
            options.transaction,
          );
        }
      },
      afterDestroy: async (order, options) => {
        await createAuditLog(
          "Order",
          order.id,
          "delete",
          null,
          order.dataValues,
          null,
          options.transaction,
        );
      },
    },
    indexes: [
      { fields: ["userId", "status"] },
      { fields: ["status"] },
      { fields: ["createdAt"] },
    ],
  },
);

export default Order;
