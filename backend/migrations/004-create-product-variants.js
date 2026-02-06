import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("productVariants", {
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("productVariants", ["productId"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("productVariants");
}
