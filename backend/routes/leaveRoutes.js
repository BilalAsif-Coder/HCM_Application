
import express from "express";

import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave
} from "../controllers/leaveController.js";

import {
  protect,
  allowRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Employee routes
router.post("/", allowRoles("employee"), applyLeave);
router.get("/my", allowRoles("employee"), getMyLeaves);

// Admin and HR routes
router.get("/", allowRoles("admin", "hr"), getAllLeaves);
router.patch("/:id/review", allowRoles("admin", "hr"), reviewLeave);

export default router;
