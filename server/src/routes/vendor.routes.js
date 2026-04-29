import express from "express";
import {
  createVendor,
  getMyVendors,
  getMyVendorById,
  getAllVendorsForAdmin,
  getVendorByIdForAdmin,
} from "../controllers/vendor.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("executive"),
  upload.single("shop_image"),
  createVendor
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("executive"),
  getMyVendors
);

router.get(
  "/my/:id",
  authMiddleware,
  roleMiddleware("executive"),
  getMyVendorById
);

router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllVendorsForAdmin
);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getVendorByIdForAdmin
);

import {
  updateMyVendor,
  deleteMyVendor,
  getMyVendorOrders,
  getMyVendorPayments,
} from "../controllers/vendor.controller.js";

router.put(
  "/my/:id",
  authMiddleware,
  roleMiddleware("executive"),
  upload.single("shop_image"),
  updateMyVendor
);

router.delete(
  "/my/:id",
  authMiddleware,
  roleMiddleware("executive"),
  deleteMyVendor
);

router.get(
  "/my/:id/orders",
  authMiddleware,
  roleMiddleware("executive"),
  getMyVendorOrders
);

router.get(
  "/my/:id/payments",
  authMiddleware,
  roleMiddleware("executive"),
  getMyVendorPayments
);

export default router;