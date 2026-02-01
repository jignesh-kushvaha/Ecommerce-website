import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("products", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

  await queryInterface.addIndex("products", ["category_id"]);
  await queryInterface.addIndex("products", ["is_active", "category_id"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("products");
}
