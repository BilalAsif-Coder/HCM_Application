
import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  allowRoles("admin", "hr"),
  getDashboardStats
);

export default router;
