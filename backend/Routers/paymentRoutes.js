import express from "express";
import * as paymentControllers from "../Controllers/paymentController.js";
import { protect, restrictTo } from "../Middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /payments/create-intent:
 *   post:
 *     summary: Create payment intent for an order
 *     description: Create a payment intent with the payment gateway for processing payment
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Payment intent created successfully
 *       404:
 *         description: Order not found
 */
router.post("/create-intent", protect, paymentControllers.createPaymentIntent);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify payment with payment gateway
 *     description: Verify payment status for an order
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - payment_gateway_id
 *             properties:
 *               order_id:
 *                 type: integer
 *               payment_gateway_id:
 *                 type: string
 *               paymentStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       404:
 *         description: Order not found
 */
router.post("/verify", protect, paymentControllers.verifyPayment);

/**
 * @swagger
 * /payments/refund:
 *   post:
 *     summary: Refund a completed payment
 *     description: Process a refund for a completed order payment
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Invalid request or cannot refund
 *       404:
 *         description: Order not found
 */
router.post("/refund", protect, paymentControllers.refundPayment);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Payment gateway webhook
 *     description: Webhook endpoint for payment gateway notifications
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/webhook", paymentControllers.handlePaymentWebhook);

export default router;
