import express from "express";
import * as orderControllers from "../Controllers/orderController.js";
import * as authMiddleware from "../Middlewares/authMiddleware.js";
import { validateRequest } from "../Middlewares/validationMiddleware.js";
import { placeOrderValidation } from "../Middlewares/validationMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     description: Place a new order with products and shipping details
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               shipping_address:
 *                 type: object
 *               payment_method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     description: Retrieve order details by ID
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve user orders (admin can see all orders)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update order status
 *     description: Update order status (admin only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       403:
 *         description: Forbidden - admin only
 */

router.use(authMiddleware.protect);

router.post(
  "/",
  validateRequest(placeOrderValidation),
  orderControllers.placeOrder,
);
router.get("/:id", orderControllers.getOrderDetails);
router.get("/", orderControllers.getAllOrders);
router.patch(
  "/:id",
  authMiddleware.restrictTo("admin"),
  orderControllers.updateOrderStatus,
);

export default router;
