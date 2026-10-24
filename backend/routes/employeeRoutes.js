
import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
} from "../controllers/employeeController.js";

import {
  protect,
  allowRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication required
router.use(protect);

// Only Admin and HR can manage employees
router.use(allowRoles("admin", "hr"));

// Get all employees and create employee
router.route("/")
  .get(getEmployees)
  .post(createEmployee);

// Get and update a specific employee
router.route("/:id")
  .get(getEmployeeById)
  .patch(updateEmployee)
  .delete(deactivateEmployee);

// Deactivate employee (frontend endpoint)
router.patch("/:id/deactivate", deactivateEmployee);

export default router;
