export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("refreshTokens", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    userId: {
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
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
    ipAddress: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  // Add indexes
  await queryInterface.addIndex("refreshTokens", ["userId"]);
  await queryInterface.addIndex("refreshTokens", ["token"]);
  await queryInterface.addIndex("refreshTokens", ["expiresAt"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("refreshTokens");
}
