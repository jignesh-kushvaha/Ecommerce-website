import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    sku: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(100),
    },
    hexColor: {
      type: DataTypes.STRING(7),
      comment: "Hex color code (e.g., #000000 for black)",
    },
    storageGb: {
      type: DataTypes.INTEGER,
    },
    ramGb: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "productVariants",
    timestamps: true,
    indexes: [{ fields: ["productId"] }],
  },
);

export default ProductVariant;
