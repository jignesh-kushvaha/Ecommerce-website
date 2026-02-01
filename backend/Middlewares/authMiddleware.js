import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import AppError from "../Utils/appError.js";
import * as statusCode from "../Constants/httpStatusCode.js";
import { catchAsync } from "../Utils/catchAsync.js";
import loggerService from "../Utils/logger.js";

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    loggerService.warn("Authentication attempt without token");
    return next(new AppError("Not authorized", statusCode.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      loggerService.warn(`User not found for token: ${decoded.id}`);
      return next(new AppError("User not found", statusCode.UNAUTHORIZED));
    }

    next();
  } catch (error) {
    loggerService.error("Token verification failed", error);
    return next(new AppError("Invalid token", statusCode.UNAUTHORIZED));
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      loggerService.warn(
        `Unauthorized access attempt by user: ${req.user.id} (role: ${req.user.user_type})`,
      );
      return next(
        new AppError(
          "You do not have permission to perform this action",
          statusCode.FORBIDDEN,
        ),
      );
    }
    next();
  };
};
