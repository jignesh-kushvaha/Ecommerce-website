import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM("create", "update", "delete"),
      allowNull: false,
    },
    changed_by: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    old_values: {
      type: DataTypes.JSONB,
    },
    new_values: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["entity_type", "entity_id"] },
      { fields: ["created_at"] },
    ],
  },
);

export default AuditLog;
