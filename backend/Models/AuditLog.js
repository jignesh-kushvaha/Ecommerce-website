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
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM("create", "update", "delete"),
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    oldValues: {
      type: DataTypes.JSONB,
    },
    newValues: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: "auditLogs",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["entityType", "entityId"] },
      { fields: ["createdAt"] },
    ],
  },
);

export default AuditLog;
