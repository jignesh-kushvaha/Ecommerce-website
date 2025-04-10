import express from "express";
import * as userControllers from "../Controllers/userControllers.js";
import * as authMiddleware from "../Middlewares/authMiddleware.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/profile", userControllers.getProfile);
router.patch(
  "/update-profile",
  upload.single("profileImage"),
  userControllers.updateProfile
);
router.patch("/change-password", userControllers.changePassword);
export default router;
