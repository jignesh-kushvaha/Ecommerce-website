import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/User.js";
import sendEmail from "../Utils/email.js";
import emailService from "../Utils/emailService.js";
import { catchAsync } from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, userType, phoneNumber, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    loggerService.warn(`Registration attempt with existing email: ${email}`);
    return next(new AppError("Email already exists", 400));
  }

  // Create user with password (will be hashed via hook)
  const newUser = await User.create({
    name,
    email,
    password_hash: password,
    user_type: userType || "customer",
    phone_number: phoneNumber,
    ...(address && {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postalCode,
    }),
  });

  loggerService.log(`User registered: ${email}`);

  // Send welcome email (non-blocking)
  (async () => {
    try {
      await emailService.sendWelcomeEmail(newUser.email, newUser.name);
    } catch (emailError) {
      loggerService.warn(
        `Failed to send welcome email to ${email}`,
        emailError,
      );
    }
  })();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        user_type: newUser.user_type,
        phone_number: newUser.phone_number,
      },
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    loggerService.warn(`Login attempt with non-existent email: ${email}`);
    return next(new AppError("Invalid credentials", 400));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    loggerService.warn(`Failed login attempt for user: ${email}`);
    return next(new AppError("Invalid credentials", 400));
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  loggerService.log(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    loggerService.warn(
      `Password reset attempt for non-existent user: ${email}`,
    );
    return next(new AppError("User not found", 404));
  }

  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  const resetUrl = `${req.protocol}://${req.get(
    "host",
  )}/api/auth/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: `Your password reset token is valid for 10 minutes.\nReset your password by clicking here: ${resetUrl}`,
    });

    loggerService.log(`Password reset email sent to: ${email}`);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    loggerService.error(
      `Failed to send password reset email to ${email}`,
      error,
    );
    return next(new AppError("Failed to send email", 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      loggerService.warn(
        `Password reset attempt for non-existent user ID: ${decoded.id}`,
      );
      return next(new AppError("User not found", 404));
    }

    // Update password (will be hashed via hook)
    user.password_hash = password;
    await user.save();

    loggerService.log(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    loggerService.error("Password reset token verification failed", error);
    return next(new AppError("Invalid or expired token", 400));
  }
});
