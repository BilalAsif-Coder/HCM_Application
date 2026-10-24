
import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} from "../controllers/announcementController.js";

import {
  protect,
  allowRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAnnouncements);

router.post(
  "/",
  allowRoles("admin", "hr"),
  createAnnouncement
);

router.delete(
  "/:id",
  allowRoles("admin"),
  deleteAnnouncement
);

export default router;
