export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("refresh_tokens", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    token: {
      type: Sequelize.STRING(512),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
    ip_address: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  // Add indexes
  await queryInterface.addIndex("refresh_tokens", ["user_id"]);
  await queryInterface.addIndex("refresh_tokens", ["token"]);
  await queryInterface.addIndex("refresh_tokens", ["expires_at"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("refresh_tokens");
}
