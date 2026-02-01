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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    order_number: {
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
    payment_method: {
      type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer"),
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    idempotency_key: {
      type: DataTypes.UUID,
      unique: true,
      defaultValue: () => uuidv4(),
    },
    shipping_name: {
      type: DataTypes.STRING(255),
    },
    shipping_email: {
      type: DataTypes.STRING(255),
    },
    shipping_phone: {
      type: DataTypes.STRING(20),
    },
    shipping_street: {
      type: DataTypes.STRING(255),
    },
    shipping_city: {
      type: DataTypes.STRING(100),
    },
    shipping_state: {
      type: DataTypes.STRING(100),
    },
    shipping_country: {
      type: DataTypes.STRING(100),
    },
    shipping_postal_code: {
      type: DataTypes.STRING(20),
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
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
      { fields: ["user_id", "status"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
  },
);

export default Order;
