
import express from "express";
import {
  setupOrganization,
  login,
  getMe,
  changePassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/setup", setupOrganization);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

export default router;
