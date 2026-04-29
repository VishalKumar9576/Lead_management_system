import express from "express";
import {
  createExecutive,
  getAllExecutives,
  assignExecutiveArea,
  getExecutiveAreaMappings,
  getExecutiveDetailsForAdmin,
  getExecutivePerformanceListForAdmin,
} from "../controllers/executive.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin"), createExecutive);
router.get("/", authMiddleware, roleMiddleware("admin"), getAllExecutives);

router.post(
  "/assign-area",
  authMiddleware,
  roleMiddleware("admin"),
  assignExecutiveArea
);

router.get(
  "/area-mappings",
  authMiddleware,
  roleMiddleware("admin"),
  getExecutiveAreaMappings
);


router.get(
  "/performance",
  authMiddleware,
  roleMiddleware("admin"),
  getExecutivePerformanceListForAdmin
);

router.get(
  "/:id/details",
  authMiddleware,
  roleMiddleware("admin"),
  getExecutiveDetailsForAdmin
);


export default router;