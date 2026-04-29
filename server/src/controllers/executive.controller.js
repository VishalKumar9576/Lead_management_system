import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createExecutive = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const {
      executive_code,
      full_name,
      phone,
      email,
      password,
      pan_number,
      aadhar_number,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
      bank_name,
      commission_percent,
      joined_date,
      notes,
    } = req.body;

    if (!executive_code || !full_name || !phone || !password) {
      return sendError(
        res,
        "Executive code, full name, phone and password are required",
        400
      );
    }

    const [existingPhone] = await pool.query(
      `SELECT id FROM executives WHERE phone = ? LIMIT 1`,
      [phone]
    );

    if (existingPhone.length > 0) {
      return sendError(res, "Executive phone already exists", 409);
    }

    const [existingCode] = await pool.query(
      `SELECT id FROM executives WHERE executive_code = ? LIMIT 1`,
      [executive_code]
    );

    if (existingCode.length > 0) {
      return sendError(res, "Executive code already exists", 409);
    }

    if (email) {
      const [existingEmail] = await pool.query(
        `SELECT id FROM executives WHERE email = ? LIMIT 1`,
        [email]
      );

      if (existingEmail.length > 0) {
        return sendError(res, "Executive email already exists", 409);
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO executives (
        executive_code,
        full_name,
        phone,
        email,
        password_hash,
        pan_number,
        aadhar_number,
        bank_account_name,
        bank_account_number,
        bank_ifsc,
        bank_name,
        commission_percent,
        status,
        joined_date,
        notes,
        created_by_admin_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `,
      [
        executive_code,
        full_name,
        phone,
        email || null,
        password_hash,
        pan_number || null,
        aadhar_number || null,
        bank_account_name || null,
        bank_account_number || null,
        bank_ifsc || null,
        bank_name || null,
        commission_percent || 20,
        joined_date || null,
        notes || null,
        adminId,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        executive_code,
        full_name,
        phone,
        email,
        pan_number,
        aadhar_number,
        bank_account_name,
        bank_account_number,
        bank_ifsc,
        bank_name,
        commission_percent,
        status,
        joined_date,
        notes,
        created_by_admin_id,
        created_at
      FROM executives
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return sendSuccess(res, "Executive created successfully", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const getAllExecutives = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let sql = `
      SELECT
        e.id,
        e.executive_code,
        e.full_name,
        e.phone,
        e.email,
        e.commission_percent,
        e.status,
        e.joined_date,
        e.created_at,
        a.full_name AS created_by_admin_name
      FROM executives e
      LEFT JOIN admins a ON e.created_by_admin_id = a.id
      WHERE 1 = 1
    `;

    const values = [];

    if (status) {
      sql += ` AND e.status = ?`;
      values.push(status);
    }

    if (search) {
      sql += ` AND (
        e.full_name LIKE ?
        OR e.phone LIKE ?
        OR e.executive_code LIKE ?
        OR e.email LIKE ?
      )`;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY e.id DESC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "Executives fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const assignExecutiveArea = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { executive_id, area_id } = req.body;

    if (!executive_id || !area_id) {
      return sendError(res, "Executive id and area id are required", 400);
    }

    const [executiveRows] = await pool.query(
      `SELECT id, full_name FROM executives WHERE id = ? LIMIT 1`,
      [executive_id]
    );

    if (executiveRows.length === 0) {
      return sendError(res, "Executive not found", 404);
    }

    const [areaRows] = await pool.query(
      `SELECT id, area_name FROM areas WHERE id = ? LIMIT 1`,
      [area_id]
    );

    if (areaRows.length === 0) {
      return sendError(res, "Area not found", 404);
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM executive_areas
      WHERE executive_id = ? AND area_id = ?
      LIMIT 1
      `,
      [executive_id, area_id]
    );

    if (existingRows.length > 0) {
      return sendError(res, "This executive is already assigned to this area", 409);
    }

    const [result] = await pool.query(
      `
      INSERT INTO executive_areas (
        executive_id,
        area_id,
        assigned_by_admin_id,
        is_active
      )
      VALUES (?, ?, ?, TRUE)
      `,
      [executive_id, area_id, adminId]
    );

    const [rows] = await pool.query(
      `
      SELECT
        ea.id,
        ea.executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        ea.area_id,
        ar.area_name,
        ar.area_code,
        ea.assigned_by_admin_id,
        ad.full_name AS assigned_by_admin_name,
        ea.is_active,
        ea.assigned_at
      FROM executive_areas ea
      INNER JOIN executives e ON ea.executive_id = e.id
      INNER JOIN areas ar ON ea.area_id = ar.id
      LEFT JOIN admins ad ON ea.assigned_by_admin_id = ad.id
      WHERE ea.id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return sendSuccess(res, "Executive assigned to area successfully", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const getExecutiveAreaMappings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        ea.id,
        ea.executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        e.phone AS executive_phone,
        ea.area_id,
        ar.area_name,
        ar.area_code,
        ar.city,
        ar.state,
        ea.is_active,
        ea.assigned_at,
        ad.full_name AS assigned_by_admin_name
      FROM executive_areas ea
      INNER JOIN executives e ON ea.executive_id = e.id
      INNER JOIN areas ar ON ea.area_id = ar.id
      LEFT JOIN admins ad ON ea.assigned_by_admin_id = ad.id
      ORDER BY ea.id DESC
      `
    );

    return sendSuccess(res, "Executive area mappings fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};


export const getExecutiveDetailsForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [executiveRows] = await pool.query(
      `
      SELECT
        e.id,
        e.executive_code,
        e.full_name,
        e.phone,
        e.email,
        e.pan_number,
        e.aadhar_number,
        e.bank_account_name,
        e.bank_account_number,
        e.bank_ifsc,
        e.bank_name,
        e.commission_percent,
        e.status,
        e.joined_date,
        e.notes,
        e.created_at,
        ad.full_name AS created_by_admin_name
      FROM executives e
      LEFT JOIN admins ad ON e.created_by_admin_id = ad.id
      WHERE e.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (executiveRows.length === 0) {
      return sendError(res, "Executive not found", 404);
    }

    const [areaRows] = await pool.query(
      `
      SELECT
        ea.id,
        ea.area_id,
        a.area_code,
        a.area_name,
        a.city,
        a.state,
        ea.is_active,
        ea.assigned_at
      FROM executive_areas ea
      INNER JOIN areas a ON ea.area_id = a.id
      WHERE ea.executive_id = ?
      ORDER BY ea.id DESC
      `,
      [id]
    );

    const [salesRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(final_amount), 0) AS total_sales,
        COALESCE(SUM(paid_amount), 0) AS paid_amount,
        COALESCE(SUM(due_amount), 0) AS due_amount,
        COUNT(id) AS total_orders,
        COUNT(DISTINCT vendor_id) AS vendors_served,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) AS pending_approval,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_orders,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) AS assigned_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_orders
      FROM orders
      WHERE executive_id = ?
      `,
      [id]
    );

    const [monthlyRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(final_amount), 0) AS month_sales,
        COUNT(id) AS month_orders
      FROM orders
      WHERE executive_id = ?
        AND MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
      `,
      [id]
    );

    const [recentOrders] = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        v.shop_name,
        a.area_name,
        o.status,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.payment_status,
        o.created_at
      FROM orders o
      INNER JOIN vendors v ON o.vendor_id = v.id
      INNER JOIN areas a ON o.area_id = a.id
      WHERE o.executive_id = ?
      ORDER BY o.id DESC
      LIMIT 8
      `,
      [id]
    );

    const executive = executiveRows[0];
    const sales = salesRows[0] || {};
    const monthly = monthlyRows[0] || {};

    const monthlyTarget = 200000;
    const monthSales = Number(monthly.month_sales || 0);
    const targetPercent = Math.round((monthSales / monthlyTarget) * 100);

    let commission = 0;
    if (monthSales >= monthlyTarget) {
      commission = Math.round(monthSales * 0.02);
    } else if (monthSales >= monthlyTarget * 0.75) {
      commission = Math.round(monthSales * 0.01);
    }

    return sendSuccess(res, "Executive details fetched successfully", {
      executive,
      areas: areaRows,
      sales: {
        total_sales: Number(sales.total_sales || 0),
        paid_amount: Number(sales.paid_amount || 0),
        due_amount: Number(sales.due_amount || 0),
        total_orders: Number(sales.total_orders || 0),
        vendors_served: Number(sales.vendors_served || 0),
        pending_approval: Number(sales.pending_approval || 0),
        approved_orders: Number(sales.approved_orders || 0),
        assigned_orders: Number(sales.assigned_orders || 0),
        delivered_orders: Number(sales.delivered_orders || 0),
        rejected_orders: Number(sales.rejected_orders || 0),
      },
      monthlyPerformance: {
        monthlyTarget,
        month_sales: monthSales,
        month_orders: Number(monthly.month_orders || 0),
        target_percent: targetPercent,
        commission,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutivePerformanceListForAdmin = async (req, res, next) => {
  try {
    const { search, status, sort = "sales_desc" } = req.query;

    let sql = `
      SELECT
        e.id,
        e.executive_code,
        e.full_name,
        e.phone,
        e.email,
        e.commission_percent,
        e.status,
        e.joined_date,
        COUNT(DISTINCT ea.area_id) AS assigned_areas,
        COUNT(DISTINCT v.id) AS total_vendors,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount,
        COUNT(DISTINCT o.vendor_id) AS vendors_served,
        SUM(CASE WHEN o.status = 'pending_approval' THEN 1 ELSE 0 END) AS pending_approval,
        SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders
      FROM executives e
      LEFT JOIN executive_areas ea ON ea.executive_id = e.id AND ea.is_active = TRUE
      LEFT JOIN vendors v ON v.executive_id = e.id
      LEFT JOIN orders o ON o.executive_id = e.id
      WHERE 1=1
    `;

    const values = [];

    if (status) {
      sql += ` AND e.status = ?`;
      values.push(status);
    }

    if (search) {
      sql += `
        AND (
          e.full_name LIKE ?
          OR e.phone LIKE ?
          OR e.executive_code LIKE ?
          OR e.email LIKE ?
        )
      `;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern);
    }

    sql += `
      GROUP BY
        e.id,
        e.executive_code,
        e.full_name,
        e.phone,
        e.email,
        e.commission_percent,
        e.status,
        e.joined_date
    `;

    if (sort === "due_desc") {
      sql += ` ORDER BY due_amount DESC`;
    } else if (sort === "orders_desc") {
      sql += ` ORDER BY total_orders DESC`;
    } else if (sort === "name_asc") {
      sql += ` ORDER BY e.full_name ASC`;
    } else {
      sql += ` ORDER BY total_sales DESC`;
    }

    const [rows] = await pool.query(sql, values);

    const monthlyTarget = 200000;

    const data = rows.map((item) => {
      const totalSales = Number(item.total_sales || 0);
      const targetPercent = Math.round((totalSales / monthlyTarget) * 100);

      let commission = 0;
      if (totalSales >= monthlyTarget) {
        commission = Math.round(totalSales * 0.02);
      } else if (totalSales >= monthlyTarget * 0.75) {
        commission = Math.round(totalSales * 0.01);
      }

      return {
        ...item,
        total_sales: totalSales,
        paid_amount: Number(item.paid_amount || 0),
        due_amount: Number(item.due_amount || 0),
        target_percent: targetPercent,
        commission,
      };
    });

    return sendSuccess(res, "Executive performance list fetched successfully", data);
  } catch (error) {
    next(error);
  }
};