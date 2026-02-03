import express from "express";
import { initializeDatabase, defineAssociations } from "./config/init.js";
import productRoutes from "./Routers/productRoutes.js";
import orderRoutes from "./Routers/orderRoutes.js";
import authRoutes from "./Routers/authRoutes.js";
import userRoutes from "./Routers/userRoutes.js";
import adminRoutes from "./Routers/adminRoutes.js";
import cartRoutes from "./Routers/cartRoutes.js";
import paymentRoutes from "./Routers/paymentRoutes.js";
import dotenv from "dotenv";
import globalErrorHandler from "./Middlewares/errorMiddleware.js";
import AppError from "./Utils/appError.js";
import rateLimitMiddleware from "./Middlewares/rateLimitMiddleware.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import loggerService from "./Utils/logger.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config({
  path: "./config.env",
});

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PostgreSQL database
await initializeDatabase();
console.log("Database initialized");

const app = express();

// CORS configuration - env-based
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
loggerService.log(`CORS enabled for: ${corsOrigin}`);

app.use(express.json());

// Cookie parser for refresh token
app.use(cookieParser());

// Apply rate limiting to all API routes
app.use("/", rateLimitMiddleware);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));
loggerService.log(
  `Static files served from: ${path.join(__dirname, "public")}`,
);

// Swagger documentation (not rate-limited)
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec));
loggerService.log("Swagger documentation available at /api-docs");

// API Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

// Health check endpoint (exempt from rate limiting via middleware config)
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.listen(process.env.PORT, () => {
  loggerService.log(`Server running on port ${process.env.PORT}`);
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
