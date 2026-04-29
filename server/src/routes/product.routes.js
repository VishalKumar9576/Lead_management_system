import express from "express";
import {
  createProduct,
  getAllProducts,
  getActiveProductsForExecutive,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  getAllProducts
);

router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createProduct
);

router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateProduct
);

router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteProduct
);

router.get(
  "/executive",
  authMiddleware,
  roleMiddleware("executive"),
  getActiveProductsForExecutive
);

export default router;