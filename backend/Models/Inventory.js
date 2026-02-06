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
    variantId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: "productVariants",
        key: "id",
      },
    },
    quantityAvailable: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    quantityReserved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastRestockAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "inventory",
    timestamps: true,
    indexes: [{ fields: ["variantId"] }],
  },
);

export default Inventory;
