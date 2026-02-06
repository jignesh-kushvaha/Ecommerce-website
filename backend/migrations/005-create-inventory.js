import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("inventory", {
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("inventory", ["variantId"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("inventory");
}
