import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("product_variants", {
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("product_variants", ["product_id"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("product_variants");
}
