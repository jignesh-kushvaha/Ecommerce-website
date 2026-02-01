import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import loggerService from "../Utils/logger.js";

dotenv.config({ path: "./config.env" });

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15000; // 15 seconds
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === "/health";
  },
  handler: (req, res) => {
    loggerService.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export default limiter;
