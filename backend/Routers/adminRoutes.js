import express from "express";
import * as adminController from "../Controllers/adminController.js";
import * as authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Protect all admin routes and restrict to admin only
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("admin"));

// Dashboard statistics
router.get("/dashboard-stats", adminController.getDashboardStats);

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);

// Order management routes
router.get("/orders", adminController.getAllOrders);

export default router;
