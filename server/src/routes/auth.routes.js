import express from "express";
import {
  adminLogin,
  executiveLogin,
  getMyProfile,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { sendSuccess } from "../utils/response.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/executive/login", executiveLogin);
router.get("/me", authMiddleware, getMyProfile);

router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    return sendSuccess(res, "Admin protected route working", {
      user: req.user,
    });
  }
);

router.get(
  "/executive-only",
  authMiddleware,
  roleMiddleware("executive"),
  (req, res) => {
    return sendSuccess(res, "Executive protected route working", {
      user: req.user,
    });
  }
);

export default router;