import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/User.js";
import RefreshToken from "../Models/RefreshToken.js";
import sendEmail from "../Utils/email.js";
import emailService from "../Utils/emailService.js";
import { catchAsync } from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

// Helper to generate tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = async (userId, req) => {
  const refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
  const token = jwt.sign({ id: userId }, refreshTokenSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    user_id: userId,
    token,
    expires_at: expiresAt,
    ip_address: req.ip,
    user_agent: req.get("user-agent"),
  });

  return token;
};

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

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id, req);

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  loggerService.log(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
      },
    },
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

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    loggerService.warn("Refresh token request without token in cookie");
    return next(new AppError("Refresh token not found", 401));
  }

  try {
    const refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);

    if (!decoded) {
      return next(new AppError("Invalid refresh token", 401));
    }

    // Check if token exists in database and not revoked
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        user_id: decoded.id,
        revoked_at: null,
      },
    });

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      loggerService.warn(
        `Invalid/expired refresh token for user ${decoded.id}`,
      );
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id);

    loggerService.log(`Access token refreshed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    loggerService.error("Refresh token verification failed", error);
    return next(new AppError("Invalid refresh token", 401));
  }
});

export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const userId = req.user.id;

  if (refreshToken) {
    // Revoke refresh token in database
    await RefreshToken.update(
      { revoked_at: new Date() },
      {
        where: {
          token: refreshToken,
          user_id: userId,
        },
      },
    );
  }

  // Clear cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  loggerService.log(`User logged out: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
