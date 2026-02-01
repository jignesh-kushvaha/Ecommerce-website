import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Inventory = sequelize.define(
  "Inventory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    variant_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: "product_variants",
        key: "id",
      },
    },
    quantity_available: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    quantity_reserved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_restock_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "inventory",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["variant_id"] }],
  },
);

export default Inventory;
