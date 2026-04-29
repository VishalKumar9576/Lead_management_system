import express from "express";
import {
  createPaymentEntry,
  getPaymentsByOrder,
  getMyDueOrders,
  getAllDueOrdersForAdmin,
  getPaymentSummaryForAdmin,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "executive"),
  createPaymentEntry
);

router.get(
  "/order/:orderId",
  authMiddleware,
  roleMiddleware("admin", "executive"),
  getPaymentsByOrder
);

router.get(
  "/my-dues",
  authMiddleware,
  roleMiddleware("executive"),
  getMyDueOrders
);

router.get(
  "/admin/due-orders",
  authMiddleware,
  roleMiddleware("admin"),
  getAllDueOrdersForAdmin
);

router.get(
  "/admin/summary",
  authMiddleware,
  roleMiddleware("admin"),
  getPaymentSummaryForAdmin
);

export default router;