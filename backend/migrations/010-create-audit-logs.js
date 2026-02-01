import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("audit_logs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM("create", "update", "delete"),
      allowNull: false,
    },
    changed_by: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    old_values: {
      type: DataTypes.JSONB,
    },
    new_values: {
      type: DataTypes.JSONB,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("audit_logs", ["entity_type", "entity_id"]);
  await queryInterface.addIndex("audit_logs", ["created_at"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("audit_logs");
}
