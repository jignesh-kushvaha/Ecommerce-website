import User from "../Models/User.js";
import bcrypt from "bcrypt";
import { catchAsync } from "../Utils/catchAsync.js";
import * as statusCode from "../Constants/httpStatusCode.js";
import loggerService from "../Utils/logger.js";
import AppError from "../Utils/appError.js";

export const updateProfile = catchAsync(async (req, res) => {
  const updateData = { ...req.body };

  // Parse address if it's a string (from multipart form data)
  if (updateData.address && typeof updateData.address === "string") {
    try {
      updateData.address = JSON.parse(updateData.address);
    } catch (error) {
      loggerService.error("Error parsing address JSON", error);
      return res.status(statusCode.BAD_REQUEST).json({
        success: false,
        message: "Invalid address format",
      });
    }
  }

  // Handle file upload
  if (req.file) {
    updateData.profile_image_url = `/uploads/${req.file.filename}`;
  }

  const updatedUser = await User.update(updateData, {
    where: { id: req.user.id },
    returning: true,
    individualHooks: true,
  });

  loggerService.log(`User profile updated: ${req.user.id}`);

  res.status(statusCode.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser[1][0],
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(
        "Current password and new password are required",
        statusCode.BAD_REQUEST,
      ),
    );
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    loggerService.warn(`Failed password change attempt for user: ${user.id}`);
    return res.status(statusCode.UNAUTHORIZED).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  if (newPassword.length < 8) {
    return res.status(statusCode.BAD_REQUEST).json({
      success: false,
      message: "New password must be at least 8 characters long",
    });
  }

  // Update password (will be hashed via hook)
  user.password_hash = newPassword;
  await user.save();

  loggerService.log(`Password changed for user: ${user.id}`);

  res.status(statusCode.OK).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password_hash"] },
  });

  if (!user) {
    return next(new AppError("User not found", statusCode.NOT_FOUND));
  }

  res.status(statusCode.OK).json({
    success: true,
    data: user,
  });
});
