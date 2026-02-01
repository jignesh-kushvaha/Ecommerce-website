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
    product_id: {
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
    storage_gb: {
      type: DataTypes.INTEGER,
    },
    ram_gb: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["product_id"] }],
  },
);

export default ProductVariant;
