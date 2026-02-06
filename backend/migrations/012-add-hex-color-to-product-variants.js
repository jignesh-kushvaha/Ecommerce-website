import { DataTypes } from "sequelize";

export async function up(queryInterface, sequelize) {
  const transaction = await sequelize.transaction();
  try {
    await queryInterface.addColumn(
      "productVariants",
      "hexColor",
      {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: "Hex color code (e.g., #000000 for black)",
      },
      { transaction },
    );

    await transaction.commit();
    console.log("Migration: Added hexColor column to productVariants");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface, sequelize) {
  const transaction = await sequelize.transaction();
  try {
    await queryInterface.removeColumn("product_variants", "hex_color", {
      transaction,
    });

    await transaction.commit();
    console.log("Migration: Removed hex_color column from product_variants");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
