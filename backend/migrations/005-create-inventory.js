import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("inventory", {
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("inventory", ["variant_id"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("inventory");
}
