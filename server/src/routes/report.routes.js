import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

import {
  getExecutiveSummary,
  getExecutiveVendorSales,
  getExecutiveAreaSales,
  getExecutiveDues,
  getExecutiveCommission,
  getExecutiveTopVendors,
  getExecutiveDailyTrend,

  getAdminSummary,
  getAdminExecutivePerformance,
  getAdminAreaPerformance,
  getAdminDailyTrend,
  getAdminDueAlerts,
  getAdminVendorDueReport,
  getAdminOrderReport,
  getAdminPaymentReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get(
  "/executive/summary",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveSummary
);

router.get(
  "/executive/vendors",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveVendorSales
);

router.get(
  "/executive/areas",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveAreaSales
);

router.get(
  "/executive/dues",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveDues
);

router.get(
  "/executive/commission",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveCommission
);

router.get(
  "/executive/top-vendors",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveTopVendors
);

router.get(
  "/executive/daily-trend",
  authMiddleware,
  roleMiddleware("executive"),
  getExecutiveDailyTrend
);


router.get(
  "/admin/summary",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminSummary
);

router.get(
  "/admin/executives",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminExecutivePerformance
);

router.get(
  "/admin/areas",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminAreaPerformance
);

router.get(
  "/admin/daily-trend",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDailyTrend
);

router.get(
  "/admin/due-alerts",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDueAlerts
);



router.get(
  "/admin/vendor-dues",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminVendorDueReport
);

router.get(
  "/admin/orders",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminOrderReport
);

router.get(
  "/admin/payments",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminPaymentReport
);

export default router;