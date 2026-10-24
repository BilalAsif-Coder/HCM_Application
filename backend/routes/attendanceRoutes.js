
import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
} from "../controllers/attendanceController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/my", allowRoles("employee"), getMyAttendance);
router.get("/", allowRoles("admin", "hr"), getAllAttendance);

export default router;
