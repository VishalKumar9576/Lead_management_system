import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderItems,
  getOrderInvoice,
  getAllOrdersForAdmin,
  approveOrder,
  rejectOrder,
  assignOrder,
} from "../controllers/order.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("executive"),
  createOrder
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("executive"),
  getMyOrders
);


router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllOrdersForAdmin
);

router.patch(
  "/admin/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveOrder
);

router.patch(
  "/admin/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectOrder
);

router.patch(
  "/admin/:id/assign",
  authMiddleware,
  roleMiddleware("admin"),
  assignOrder
);

router.get(
  "/:id/invoice",
  authMiddleware,
  roleMiddleware("executive", "admin"),
  getOrderInvoice
);

router.get(
  "/:id/items",
  authMiddleware,
  getOrderItems
);

export default router;