import db from "../config/db.js";

const getExecutiveId = (req) => {
  return req.user?.id || req.user?.executive_id;
};

const buildReportFilters = (req) => {
  const executiveId = getExecutiveId(req);
  const { from, to, area_id, vendor_id, status } = req.query;

  let where = "WHERE o.executive_id = ?";
  const params = [executiveId];

  if (from) {
    where += " AND DATE(o.created_at) >= ?";
    params.push(from);
  }

  if (to) {
    where += " AND DATE(o.created_at) <= ?";
    params.push(to);
  }

  if (area_id) {
    where += " AND o.area_id = ?";
    params.push(area_id);
  }

  if (vendor_id) {
    where += " AND o.vendor_id = ?";
    params.push(vendor_id);
  }

  if (status) {
    where += " AND o.status = ?";
    params.push(status);
  }

  return { where, params };
};

export const getExecutiveSummary = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        COALESCE(SUM(o.final_amount), 0) AS totalSales,
        COALESCE(SUM(o.paid_amount), 0) AS paidAmount,
        COALESCE(SUM(o.due_amount), 0) AS pendingDue,
        COUNT(DISTINCT o.id) AS ordersCount,
        COUNT(DISTINCT o.vendor_id) AS vendorsServed,
        COALESCE(AVG(o.final_amount), 0) AS avgOrderValue
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      `,
      params
    );

    const summary = rows[0] || {};
    const monthlyTarget = 200000;
    const totalSales = Number(summary.totalSales || 0);

    const targetPercent = Math.min(
      Math.round((totalSales / monthlyTarget) * 100),
      100
    );

    let commission = 0;

    if (totalSales >= monthlyTarget) {
      commission = Math.round(totalSales * 0.02);
    } else if (totalSales >= monthlyTarget * 0.75) {
      commission = Math.round(totalSales * 0.01);
    }

    return res.json({
      success: true,
      data: {
        totalSales,
        paidAmount: Number(summary.paidAmount || 0),
        pendingDue: Number(summary.pendingDue || 0),
        ordersCount: Number(summary.ordersCount || 0),
        vendorsServed: Number(summary.vendorsServed || 0),
        avgOrderValue: Math.round(Number(summary.avgOrderValue || 0)),
        targetPercent,
        commission,
      },
    });
  } catch (error) {
    console.error("Executive summary report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch executive summary report",
    });
  }
};

export const getExecutiveVendorSales = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        v.id AS vendor_id,
        v.shop_name AS vendor_name,
        v.phone,
        a.area_name AS area_name,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY v.id, v.shop_name, v.phone, a.area_name
      ORDER BY total_sales DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Executive vendor report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor wise sales report",
    });
  }
};

export const getExecutiveAreaSales = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        a.id AS area_id,
        a.area_name AS area_name,
        COUNT(DISTINCT o.vendor_id) AS vendors,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY a.id, a.area_name
      ORDER BY total_sales DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Executive area report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch area wise sales report",
    });
  }
};

export const getExecutiveDues = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        v.id AS vendor_id,
        v.shop_name AS vendor_name,
        v.phone,
        a.area_name AS area_name,
        COALESCE(SUM(o.due_amount), 0) AS due_amount,
        MAX(o.created_at) AS last_order_date
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY v.id, v.shop_name, v.phone, a.area_name
      HAVING due_amount > 0
      ORDER BY due_amount DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Executive dues report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending dues report",
    });
  }
};

export const getExecutiveCommission = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        COALESCE(SUM(o.final_amount), 0) AS totalSales,
        COUNT(o.id) AS ordersCount
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      `,
      params
    );

    const totalSales = Number(rows[0]?.totalSales || 0);
    const monthlyTarget = 200000;

    let commissionRate = 0;
    let message = "Target not completed";

    if (totalSales >= monthlyTarget) {
      commissionRate = 2;
      message = "Target completed. 2% commission earned.";
    } else if (totalSales >= monthlyTarget * 0.75) {
      commissionRate = 1;
      message = "75% target completed. 1% commission earned.";
    }

    const commission = Math.round((totalSales * commissionRate) / 100);
    const targetPercent = Math.round((totalSales / monthlyTarget) * 100);

    return res.json({
      success: true,
      data: {
        monthlyTarget,
        totalSales,
        targetPercent,
        commissionRate,
        commission,
        message,
      },
    });
  } catch (error) {
    console.error("Executive commission report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission report",
    });
  }
};


export const getExecutiveTopVendors = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const limit = Number(req.query.limit || 5);

    const [rows] = await db.query(
      `
      SELECT
        v.id AS vendor_id,
        v.shop_name AS vendor_name,
        v.phone,
        a.area_name AS area_name,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY v.id, v.shop_name, v.phone, a.area_name
      ORDER BY total_sales DESC
      LIMIT ?
      `,
      [...params, limit]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Executive top vendors report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top vendors report",
    });
  }
};

export const getExecutiveDailyTrend = async (req, res) => {
  try {
    const { where, params } = buildReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        DATE(o.created_at) AS report_date,
        COUNT(o.id) AS orders,
        COUNT(DISTINCT o.vendor_id) AS vendors,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount
      FROM orders o
      LEFT JOIN vendors v ON v.id = o.vendor_id
      LEFT JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY DATE(o.created_at)
      ORDER BY report_date ASC
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Executive daily trend report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily trend report",
    });
  }
};



const buildAdminReportFilters = (req) => {
  const {
    from,
    to,
    executive_id,
    area_id,
    vendor_id,
    status,
    payment_status,
    search,
  } = req.query;

  let where = "WHERE 1=1";
  const params = [];

  if (from) {
    where += " AND DATE(o.created_at) >= ?";
    params.push(from);
  }

  if (to) {
    where += " AND DATE(o.created_at) <= ?";
    params.push(to);
  }

  if (executive_id) {
    where += " AND o.executive_id = ?";
    params.push(executive_id);
  }

  if (area_id) {
    where += " AND o.area_id = ?";
    params.push(area_id);
  }

  if (vendor_id) {
    where += " AND o.vendor_id = ?";
    params.push(vendor_id);
  }

  if (status) {
    where += " AND o.status = ?";
    params.push(status);
  }

  if (payment_status) {
    where += " AND o.payment_status = ?";
    params.push(payment_status);
  }

  if (search) {
    where += `
      AND (
        o.order_number LIKE ?
        OR v.shop_name LIKE ?
        OR v.owner_name LIKE ?
        OR e.full_name LIKE ?
        OR e.executive_code LIKE ?
        OR a.area_name LIKE ?
      )
    `;
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern, pattern, pattern, pattern);
  }

  return { where, params };
};

export const getAdminSummary = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [[orderSummary]] = await db.query(
      `
      SELECT
        COALESCE(SUM(o.final_amount), 0) AS totalSales,
        COALESCE(SUM(o.paid_amount), 0) AS paidAmount,
        COALESCE(SUM(o.due_amount), 0) AS pendingDue,
        COUNT(o.id) AS totalOrders,
        COALESCE(AVG(o.final_amount), 0) AS avgOrderValue,
        SUM(CASE WHEN o.status = 'pending_approval' THEN 1 ELSE 0 END) AS pendingApproval,
        SUM(CASE WHEN o.status = 'approved' THEN 1 ELSE 0 END) AS approvedOrders,
        SUM(CASE WHEN o.status = 'assigned' THEN 1 ELSE 0 END) AS assignedOrders,
        SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
        SUM(CASE WHEN o.status = 'rejected' THEN 1 ELSE 0 END) AS rejectedOrders
      FROM orders o
      ${where}
      `,
      params
    );

    const [[masterSummary]] = await db.query(
      `
      SELECT
        (SELECT COUNT(*) FROM executives) AS totalExecutives,
        (SELECT COUNT(*) FROM vendors) AS totalVendors,
        (SELECT COUNT(*) FROM areas) AS totalAreas
      `
    );

    const [[todaySummary]] = await db.query(
      `
      SELECT
        COALESCE(SUM(final_amount), 0) AS todaySales,
        COUNT(id) AS todayOrders
      FROM orders
      WHERE DATE(created_at) = CURDATE()
      `
    );

    const [[monthSummary]] = await db.query(
      `
      SELECT
        COALESCE(SUM(final_amount), 0) AS monthSales,
        COUNT(id) AS monthOrders
      FROM orders
      WHERE MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
      `
    );

    return res.json({
      success: true,
      data: {
        totalSales: Number(orderSummary.totalSales || 0),
        paidAmount: Number(orderSummary.paidAmount || 0),
        pendingDue: Number(orderSummary.pendingDue || 0),
        totalOrders: Number(orderSummary.totalOrders || 0),
        avgOrderValue: Math.round(Number(orderSummary.avgOrderValue || 0)),
        pendingApproval: Number(orderSummary.pendingApproval || 0),
        approvedOrders: Number(orderSummary.approvedOrders || 0),
        assignedOrders: Number(orderSummary.assignedOrders || 0),
        deliveredOrders: Number(orderSummary.deliveredOrders || 0),
        rejectedOrders: Number(orderSummary.rejectedOrders || 0),
        totalExecutives: Number(masterSummary.totalExecutives || 0),
        totalVendors: Number(masterSummary.totalVendors || 0),
        totalAreas: Number(masterSummary.totalAreas || 0),
        todaySales: Number(todaySummary.todaySales || 0),
        todayOrders: Number(todaySummary.todayOrders || 0),
        monthSales: Number(monthSummary.monthSales || 0),
        monthOrders: Number(monthSummary.monthOrders || 0),
      },
    });
  } catch (error) {
    console.error("Admin summary report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin summary report",
    });
  }
};

export const getAdminExecutivePerformance = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        e.id AS executive_id,
        e.executive_code,
        e.full_name AS executive_name,
        e.phone,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount,
        SUM(CASE WHEN o.status = 'pending_approval' THEN 1 ELSE 0 END) AS pending_approval,
        SUM(CASE WHEN o.status = 'approved' THEN 1 ELSE 0 END) AS approved_orders,
        SUM(CASE WHEN o.status = 'assigned' THEN 1 ELSE 0 END) AS assigned_orders,
        SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
        COUNT(DISTINCT o.vendor_id) AS vendors_served
      FROM executives e
      LEFT JOIN orders o ON o.executive_id = e.id
      ${where.replace("WHERE 1=1", "WHERE 1=1")}
      GROUP BY e.id, e.executive_code, e.full_name, e.phone
      ORDER BY total_sales DESC
      `,
      params
    );

    const monthlyTarget = 200000;

    const data = rows.map((row) => {
      const totalSales = Number(row.total_sales || 0);
      const targetPercent = Math.round((totalSales / monthlyTarget) * 100);

      let commission = 0;

      if (totalSales >= monthlyTarget) {
        commission = Math.round(totalSales * 0.02);
      } else if (totalSales >= monthlyTarget * 0.75) {
        commission = Math.round(totalSales * 0.01);
      }

      return {
        ...row,
        total_sales: totalSales,
        paid_amount: Number(row.paid_amount || 0),
        due_amount: Number(row.due_amount || 0),
        target_percent: targetPercent,
        commission,
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin executive performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch executive performance report",
    });
  }
};

export const getAdminAreaPerformance = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        a.id AS area_id,
        a.area_name,
        COUNT(DISTINCT o.executive_id) AS executives,
        COUNT(DISTINCT o.vendor_id) AS vendors,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount
      FROM orders o
      INNER JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY a.id, a.area_name
      ORDER BY total_sales DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Admin area performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch area performance report",
    });
  }
};

export const getAdminDailyTrend = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        DATE(o.created_at) AS report_date,
        COUNT(o.id) AS orders,
        COUNT(DISTINCT o.executive_id) AS executives,
        COUNT(DISTINCT o.vendor_id) AS vendors,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount
      FROM orders o
      ${where}
      GROUP BY DATE(o.created_at)
      ORDER BY report_date DESC
      LIMIT 10
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Admin daily trend error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin daily trend report",
    });
  }
};

export const getAdminDueAlerts = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        e.id AS executive_id,
        e.executive_code,
        e.full_name AS executive_name,
        COUNT(o.id) AS due_orders,
        COALESCE(SUM(o.due_amount), 0) AS total_due
      FROM orders o
      INNER JOIN executives e ON e.id = o.executive_id
      ${where}
        AND o.due_amount > 0
      GROUP BY e.id, e.executive_code, e.full_name
      ORDER BY total_due DESC
      LIMIT 50
      `,
      params
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Admin due alerts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch due alert report",
    });
  }
};



export const getAdminVendorDueReport = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        v.id AS vendor_id,
        v.vendor_code,
        v.shop_name,
        v.owner_name,
        v.phone,
        e.id AS executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        a.id AS area_id,
        a.area_name,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount,
        MAX(o.created_at) AS last_order_date
      FROM orders o
      INNER JOIN vendors v ON v.id = o.vendor_id
      INNER JOIN executives e ON e.id = o.executive_id
      INNER JOIN areas a ON a.id = o.area_id
      ${where}
      GROUP BY
        v.id, v.vendor_code, v.shop_name, v.owner_name, v.phone,
        e.id, e.full_name, e.executive_code,
        a.id, a.area_name
      HAVING due_amount > 0
      ORDER BY due_amount DESC
      LIMIT 100
      `,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Admin vendor due report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor due report",
    });
  }
};

export const getAdminOrderReport = async (req, res) => {
  try {
    const { where, params } = buildAdminReportFilters(req);

    const [rows] = await db.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.created_at,
        v.shop_name,
        v.owner_name,
        v.phone AS vendor_phone,
        e.full_name AS executive_name,
        e.executive_code,
        a.area_name
      FROM orders o
      INNER JOIN vendors v ON v.id = o.vendor_id
      INNER JOIN executives e ON e.id = o.executive_id
      INNER JOIN areas a ON a.id = o.area_id
      ${where}
      ORDER BY o.id DESC
      LIMIT 200
      `,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Admin order report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order report",
    });
  }
};

export const getAdminPaymentReport = async (req, res) => {
  try {
    const {
      from,
      to,
      executive_id,
      vendor_id,
      payment_mode,
      settlement_status,
      search,
    } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (from) {
      where += " AND DATE(p.payment_date) >= ?";
      params.push(from);
    }

    if (to) {
      where += " AND DATE(p.payment_date) <= ?";
      params.push(to);
    }

    if (executive_id) {
      where += " AND p.executive_id = ?";
      params.push(executive_id);
    }

    if (vendor_id) {
      where += " AND p.vendor_id = ?";
      params.push(vendor_id);
    }

    if (payment_mode) {
      where += " AND p.payment_mode = ?";
      params.push(payment_mode);
    }

    if (settlement_status) {
      where += " AND p.settlement_status = ?";
      params.push(settlement_status);
    }

    if (search) {
      where += `
        AND (
          p.payment_number LIKE ?
          OR o.order_number LIKE ?
          OR v.shop_name LIKE ?
          OR e.full_name LIKE ?
          OR e.executive_code LIKE ?
        )
      `;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.payment_number,
        p.payment_mode,
        p.amount_received,
        p.received_by,
        p.payment_date,
        p.settlement_status,
        p.reference_number,
        o.order_number,
        v.shop_name,
        v.owner_name,
        e.full_name AS executive_name,
        e.executive_code
      FROM payments p
      INNER JOIN orders o ON o.id = p.order_id
      INNER JOIN vendors v ON v.id = p.vendor_id
      INNER JOIN executives e ON e.id = p.executive_id
      ${where}
      ORDER BY p.payment_date DESC
      LIMIT 200
      `,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Admin payment report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment report",
    });
  }
};