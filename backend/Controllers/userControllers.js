import Users from "../Models/userModel.js";
import bcrypt from "bcrypt";
import { catchAsync } from "../Utils/catchAsync.js";
import * as statusCode from "../Constants/httpStatusCode.js";

export const updateProfile = catchAsync(async (req, res) => {
  const updateData = { ...req.body };

  // Parse address if it's a string (from multipart form data)
  if (updateData.address && typeof updateData.address === "string") {
    try {
      updateData.address = JSON.parse(updateData.address);
    } catch (error) {
      console.error("Error parsing address JSON:", error);
      return res.status(statusCode.BAD_REQUEST).json({
        success: false,
        message: "Invalid address format",
      });
    }
  }

  // Handle file upload
  if (req.file) {
    // File path relative to the server
    updateData.profileImage = `/uploads/${req.file.filename}`;
  }

  const updatedUser = await Users.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(statusCode.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return res.status(statusCode.UNAUTHORIZED).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  if (newPassword.length < 4) {
    return res.status(statusCode.BAD_REQUEST).json({
      success: false,
      message: "Password must be at least 4 characters long",
    });
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashPassword;
  await user.save();

  res.status(statusCode.OK).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const getProfile = catchAsync(async (req, res) => {
  const user = await Users.findById(req.user.id).select("-password");
  res.status(statusCode.OK).json({
    success: true,
    data: user,
  });
});
