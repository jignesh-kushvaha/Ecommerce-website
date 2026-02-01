import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("carts", {
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("carts", ["user_id"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("carts");
}
