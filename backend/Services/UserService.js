import User from "../Models/User.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(user_id) {
    try {
      const user = await User.findByPk(user_id, {
        attributes: { exclude: ["password_hash"] },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      loggerService.log(`Retrieved user ${user_id}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting user ${user_id}`, error);
      throw new AppError("Failed to fetch user", 500);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ["password_hash"] },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      loggerService.log(`Retrieved user by email: ${email}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting user by email ${email}`, error);
      throw new AppError("Failed to fetch user", 500);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(user_id, updateData) {
    try {
      const user = await User.findByPk(user_id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Prevent updating sensitive fields
      const { password_hash, user_type, id, ...safeData } = updateData;

      await user.update(safeData);
      loggerService.log(`Updated profile for user ${user_id}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating user ${user_id}`, error);
      throw new AppError("Failed to update profile", 500);
    }
  }

  /**
   * Change user password
   */
  async changePassword(user_id, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(user_id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify old password
      const isPasswordValid = await user.comparePassword(oldPassword);
      if (!isPasswordValid) {
        loggerService.warn(`Invalid password attempt for user ${user_id}`);
        throw new AppError("Old password is incorrect", 401);
      }

      // Update password (will be hashed by model hook)
      user.password_hash = newPassword;
      await user.save();

      loggerService.log(`Password changed for user ${user_id}`);
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error changing password for user ${user_id}`, error);
      throw new AppError("Failed to change password", 500);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(limit = 10, offset = 0) {
    try {
      const users = await User.findAndCountAll({
        attributes: { exclude: ["password_hash"] },
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      loggerService.log(`Retrieved ${users.count} users`);
      return users;
    } catch (error) {
      loggerService.error("Error getting all users", error);
      throw new AppError("Failed to fetch users", 500);
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(user_id, user_type) {
    try {
      const validRoles = ["customer", "admin"];
      if (!validRoles.includes(user_type)) {
        throw new AppError("Invalid user role", 400);
      }

      const user = await User.findByPk(user_id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      await user.update({ user_type });
      loggerService.log(
        `Updated user role for user ${user_id} to ${user_type}`,
      );
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating role for user ${user_id}`, error);
      throw new AppError("Failed to update user role", 500);
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(user_id) {
    try {
      const user = await User.findByPk(user_id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      await user.update({ is_active: false });
      loggerService.log(`Deactivated user ${user_id}`);
      return { success: true, message: "User account deactivated" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error deactivating user ${user_id}`, error);
      throw new AppError("Failed to deactivate user", 500);
    }
  }
}

export default new UserService();
