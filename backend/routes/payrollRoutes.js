
import express from "express";

import {
  generatePayroll,
  getMyPayroll,
  getAllPayroll,
  markPayrollPaid
} from "../controllers/payrollController.js";

import {
  protect,
  allowRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/my", allowRoles("employee"), getMyPayroll);

router.get("/", allowRoles("admin", "hr"), getAllPayroll);

router.post(
  "/generate",
  allowRoles("admin", "hr"),
  generatePayroll
);

router.patch(
  "/:id/pay",
  allowRoles("admin"),
  markPayrollPaid
);

export default router;
