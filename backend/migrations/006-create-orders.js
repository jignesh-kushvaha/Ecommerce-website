import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("orders", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    order_number: {
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
    payment_method: {
      type: DataTypes.ENUM("credit_card", "paypal", "bank_transfer"),
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    idempotency_key: {
      type: DataTypes.UUID,
      unique: true,
    },
    shipping_name: {
      type: DataTypes.STRING(255),
    },
    shipping_email: {
      type: DataTypes.STRING(255),
    },
    shipping_phone: {
      type: DataTypes.STRING(20),
    },
    shipping_street: {
      type: DataTypes.STRING(255),
    },
    shipping_city: {
      type: DataTypes.STRING(100),
    },
    shipping_state: {
      type: DataTypes.STRING(100),
    },
    shipping_country: {
      type: DataTypes.STRING(100),
    },
    shipping_postal_code: {
      type: DataTypes.STRING(20),
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

  await queryInterface.addIndex("orders", ["user_id", "status"]);
  await queryInterface.addIndex("orders", ["status"]);
  await queryInterface.addIndex("orders", ["created_at"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("orders");
}
