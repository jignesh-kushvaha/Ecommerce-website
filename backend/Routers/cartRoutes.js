import express from "express";
import * as cartControllers from "../Controllers/cartController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart with items
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", cartControllers.getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product variant to user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variant_id
 *               - quantity
 *             properties:
 *               variant_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Invalid request
 */
router.post("/", cartControllers.addToCart);

/**
 * @swagger
 * /cart/{itemId}:
 *   patch:
 *     summary: Update cart item quantity
 *     description: Update the quantity of an item in the cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Invalid request
 */
router.patch("/:cart_item_id", cartControllers.updateCartItem);

/**
 * @swagger
 * /cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a product variant from user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart item not found
 */
router.delete("/:cart_item_id", cartControllers.removeFromCart);

/**
 * @swagger
 * /cart/clear:
 *   post:
 *     summary: Clear entire cart
 *     description: Remove all items from user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.post("/clear", cartControllers.clearCart);

/**
 * @swagger
 * /cart/validate:
 *   post:
 *     summary: Validate cart stock
 *     description: Validate that all items in cart have sufficient stock
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation result
 */
router.post("/validate", cartControllers.validateCart);

/**
 * @swagger
 * /cart/merge-guest:
 *   post:
 *     summary: Merge guest cart with user cart
 *     description: Merge items from guest (localStorage) cart with authenticated user's cart on login
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guestCartItems
 *             properties:
 *               guestCartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - variant_id
 *                     - quantity
 *                   properties:
 *                     variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Guest cart merged successfully
 *       400:
 *         description: Invalid request
 */
router.post("/merge-guest", cartControllers.mergeGuestCart);

export default router;
