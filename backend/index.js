import express from "express";
import connectDb from "./Databases/db.js";
import productRoutes from "./Routers/productRoutes.js";
import orderRoutes from "./Routers/orderRoutes.js";
import authRoutes from "./Routers/authRoutes.js";
import userRoutes from "./Routers/userRoutes.js";
import adminRoutes from "./Routers/adminRoutes.js";
import dotenv from "dotenv";
import globalErrorHandler from "./Middlewares/errorMiddleware.js";
import AppError from "./Utils/appError.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({
  path: "./config.env",
});

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDb();
const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
