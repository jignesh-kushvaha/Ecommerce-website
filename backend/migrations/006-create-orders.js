import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("orders", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer"),
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    idempotencyKey: {
      type: DataTypes.UUID,
      unique: true,
    },
    shippingName: {
      type: DataTypes.STRING(255),
    },
    shippingEmail: {
      type: DataTypes.STRING(255),
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
    },
    shippingStreet: {
      type: DataTypes.STRING(255),
    },
    shippingCity: {
      type: DataTypes.STRING(100),
    },
    shippingState: {
      type: DataTypes.STRING(100),
    },
    shippingCountry: {
      type: DataTypes.STRING(100),
    },
    shippingPostalCode: {
      type: DataTypes.STRING(20),
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

  await queryInterface.addIndex("orders", ["userId", "status"]);
  await queryInterface.addIndex("orders", ["status"]);
  await queryInterface.addIndex("orders", ["createdAt"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("orders");
}
