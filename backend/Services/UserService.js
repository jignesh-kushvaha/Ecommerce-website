import User from "../Models/User.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["passwordHash"] },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      loggerService.log(`Retrieved user ${userId}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error getting user ${userId}`, error);
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
        attributes: { exclude: ["passwordHash"] },
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
  async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Prevent updating sensitive fields
      const { passwordHash, userType, id, ...safeData } = updateData;

      await user.update(safeData);
      loggerService.log(`Updated profile for user ${userId}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating user ${userId}`, error);
      throw new AppError("Failed to update profile", 500);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify old password
      const isPasswordValid = await user.comparePassword(oldPassword);
      if (!isPasswordValid) {
        loggerService.warn(`Invalid password attempt for user ${userId}`);
        throw new AppError("Old password is incorrect", 401);
      }

      // Update password (will be hashed by model hook)
      user.passwordHash = newPassword;
      await user.save();

      loggerService.log(`Password changed for user ${userId}`);
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error changing password for user ${userId}`, error);
      throw new AppError("Failed to change password", 500);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(limit = 10, offset = 0) {
    try {
      const users = await User.findAndCountAll({
        attributes: { exclude: ["passwordHash"] },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
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
  async updateUserRole(userId, userType) {
    try {
      const validRoles = ["customer", "admin"];
      if (!validRoles.includes(userType)) {
        throw new AppError("Invalid user role", 400);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      await user.update({ userType });
      loggerService.log(`Updated user role for user ${userId} to ${userType}`);
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error updating role for user ${userId}`, error);
      throw new AppError("Failed to update user role", 500);
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      await user.update({ isActive: false });
      loggerService.log(`Deactivated user ${userId}`);
      return { success: true, message: "User account deactivated" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(`Error deactivating user ${userId}`, error);
      throw new AppError("Failed to deactivate user", 500);
    }
  }
}

export default new UserService();
