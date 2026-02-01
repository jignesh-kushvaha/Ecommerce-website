import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("cart_items", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "carts",
        key: "id",
      },
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "product_variants",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("cart_items", ["cart_id"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("cart_items");
}
