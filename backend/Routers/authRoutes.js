import express from "express";
import * as authControllers from "../Controllers/authController.js";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  validateRequest,
  registerValidation,
} from "../Middlewares/validationMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or email already exists
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password
 *     description: Reset user password using token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */

router.post(
  "/register",
  validateRequest(registerValidation),
  authControllers.register,
);
router.post("/login", authControllers.login);
router.post("/refresh", authControllers.refreshAccessToken);
router.post("/logout", protect, authControllers.logout);
router.post("/forgot-password", authControllers.forgetPassword);
router.patch("/reset-password/:token", authControllers.resetPassword);

export default router;
