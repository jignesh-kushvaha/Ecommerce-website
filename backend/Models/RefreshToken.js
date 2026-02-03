import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    ip_address: {
      type: DataTypes.STRING(45), // IPv6 support
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["token"] },
      { fields: ["expires_at"] },
    ],
  },
);

export default RefreshToken;
