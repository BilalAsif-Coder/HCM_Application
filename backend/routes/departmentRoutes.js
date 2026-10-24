
import express from "express";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

router.post("/", allowRoles("admin", "hr"), createDepartment);
router.patch("/:id", allowRoles("admin", "hr"), updateDepartment);
router.delete("/:id", allowRoles("admin"), deleteDepartment);

export default router;
