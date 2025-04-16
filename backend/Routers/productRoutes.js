import express from "express";
import * as productControllers from "../Controllers/productController.js";
import * as authMiddleware from "../Middlewares/authMiddleware.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/:id", productControllers.getOneProduct);
router.get("/", productControllers.getProduct);

// Protected routes
router.use(authMiddleware.protect);

router.post(
  "/",
  authMiddleware.restrictTo("admin"),
  upload.array("images"),
  productControllers.createProduct
);

router.patch(
  "/:id",
  authMiddleware.restrictTo("admin"),
  upload.array("images"),
  productControllers.updateProduct
);

router.post("/:id/reviews", productControllers.addReview);

// Add delete route for admins
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  productControllers.deleteProduct
);

export default router;
