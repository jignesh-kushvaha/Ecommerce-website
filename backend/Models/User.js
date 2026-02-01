import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import { createAuditLog } from "../Utils/auditHelper.js";

// Validate password complexity
const validatePasswordComplexity = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw new Error(
      "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)",
    );
  }
};

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 255],
          msg: "Password must be at least 8 characters long",
        },
        complexPassword(value) {
          validatePasswordComplexity(value);
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    user_type: {
      type: DataTypes.ENUM("admin", "customer"),
      defaultValue: "customer",
    },
    profile_image_url: {
      type: DataTypes.STRING,
    },
    street: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    postal_code: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          validatePasswordComplexity(user.password_hash);
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password_hash") && user.password_hash) {
          validatePasswordComplexity(user.password_hash);
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      afterCreate: async (user, options) => {
        await createAuditLog(
          "User",
          user.id,
          "create",
          null,
          null,
          user.dataValues,
          options.transaction,
        );
      },
      afterUpdate: async (user, options) => {
        const changedFields = user.changed();
        if (changedFields && changedFields.length > 0) {
          const oldValues = {};
          const newValues = {};
          changedFields.forEach((field) => {
            oldValues[field] = user._previousDataValues[field];
            newValues[field] = user.dataValues[field];
          });
          await createAuditLog(
            "User",
            user.id,
            "update",
            null,
            oldValues,
            newValues,
            options.transaction,
          );
        }
      },
      afterDestroy: async (user, options) => {
        await createAuditLog(
          "User",
          user.id,
          "delete",
          null,
          user.dataValues,
          null,
          options.transaction,
        );
      },
    },
  },
);

User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

export default User;
