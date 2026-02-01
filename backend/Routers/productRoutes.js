import express from "express";
import * as productControllers from "../Controllers/productController.js";
import * as authMiddleware from "../Middlewares/authMiddleware.js";
import { validateRequest } from "../Middlewares/validationMiddleware.js";
import {
  createProductValidation,
  updateProductValidation,
} from "../Middlewares/validationMiddleware.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all active products with optional filtering and pagination
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product with full details
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     description: Create a new product (admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               base_price:
 *                 type: number
 *               category_id:
 *                 type: integer
 *               brand:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update product
 *     description: Update an existing product (admin only)
 *     tags:
 *       - Products
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
 *         description: Product updated successfully
 *       403:
 *         description: Forbidden - admin only
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Delete a product (admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       403:
 *         description: Forbidden - admin only
 */

// Public routes
router.get("/:id", productControllers.getOneProduct);
router.get("/", productControllers.getProduct);

// Protected routes
router.use(authMiddleware.protect);

router.post(
  "/",
  authMiddleware.restrictTo("admin"),
  validateRequest(createProductValidation),
  upload.array("images"),
  productControllers.createProduct,
);

router.patch(
  "/:id",
  authMiddleware.restrictTo("admin"),
  validateRequest(updateProductValidation),
  upload.array("images"),
  productControllers.updateProduct,
);

router.post("/:id/reviews", productControllers.addReview);

// Add delete route for admins
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  productControllers.deleteProduct,
);

export default router;
