import express from "express";
import {
  createArea,
  getAllAreas,
  getAreaCoverageStats,
} from "../controllers/area.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();
router.get(
  "/admin/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getAreaCoverageStats
);
router.post("/", authMiddleware, roleMiddleware("admin"), createArea);
router.get("/", authMiddleware, roleMiddleware("admin", "executive"), getAllAreas);

export default router;