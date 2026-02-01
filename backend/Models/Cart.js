import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["user_id"] }],
  },
);

export default Cart;
