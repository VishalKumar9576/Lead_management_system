import pool from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

const generatePaymentNumber = () => {
  return `PAY-${Date.now()}`;
};

const calculatePaymentStatus = (totalAmount, paidAmount) => {
  const total = Number(totalAmount || 0);
  const paid = Number(paidAmount || 0);

  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
};

export const createPaymentEntry = async (req, res, next) => {
  try {
    const loginUserId = req.user.id;
    const loginUserRole = req.user.role;

    const {
      order_id,
      payment_mode,
      amount_received,
      payment_date,
      reference_number,
      note,
    } = req.body;

    if (!order_id || !payment_mode || !amount_received || !payment_date) {
      return sendError(
        res,
        "Order id, payment mode, amount received and payment date are required",
        400
      );
    }

    if (!["cash", "online"].includes(payment_mode)) {
      return sendError(res, "Payment mode must be cash or online", 400);
    }

    const numericAmount = Number(amount_received);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return sendError(res, "Amount received must be greater than 0", 400);
    }

    const [orderRows] = await pool.query(
      `
      SELECT
        id,
        order_number,
        vendor_id,
        executive_id,
        status,
        final_amount,
        paid_amount,
        due_amount,
        payment_status
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [order_id]
    );

    if (orderRows.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    const order = orderRows[0];

    if (loginUserRole === "executive" && order.executive_id !== loginUserId) {
      return sendError(res, "You can only add payment for your own orders", 403);
    }

    if (order.status !== "delivered") {
      return sendError(res, "Payment can only be added after order is delivered", 400);
    }

    const currentPaid = Number(order.paid_amount || 0);
    const totalAmount = Number(order.final_amount || 0);
    const newPaidAmount = currentPaid + numericAmount;

    if (newPaidAmount > totalAmount) {
      return sendError(res, "Received amount cannot exceed total order amount", 400);
    }

    let receivedBy = "admin";
    let settlementStatus = "verified";

    if (payment_mode === "cash") {
      if (loginUserRole === "executive") {
        receivedBy = "executive";
        settlementStatus = "pending";
      } else {
        receivedBy = "admin";
        settlementStatus = "verified";
      }
    }

    if (payment_mode === "online") {
      receivedBy = "admin";
      settlementStatus = "verified";
    }

    const paymentNumber = generatePaymentNumber();

    const [paymentResult] = await pool.query(
      `
      INSERT INTO payments (
        payment_number,
        order_id,
        vendor_id,
        executive_id,
        payment_mode,
        amount_received,
        received_by,
        payment_date,
        settlement_status,
        reference_number,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        paymentNumber,
        order.id,
        order.vendor_id,
        order.executive_id,
        payment_mode,
        numericAmount,
        receivedBy,
        payment_date,
        settlementStatus,
        reference_number || null,
        note || null,
      ]
    );

    const updatedPaidAmount = newPaidAmount;
    const updatedDueAmount = totalAmount - updatedPaidAmount;
    const updatedPaymentStatus = calculatePaymentStatus(totalAmount, updatedPaidAmount);

    await pool.query(
      `
      UPDATE orders
      SET
        paid_amount = ?,
        due_amount = ?,
        payment_status = ?
      WHERE id = ?
      `,
      [updatedPaidAmount, updatedDueAmount, updatedPaymentStatus, order.id]
    );

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.payment_number,
        p.order_id,
        o.order_number,
        p.vendor_id,
        v.shop_name,
        p.executive_id,
        e.full_name AS executive_name,
        p.payment_mode,
        p.amount_received,
        p.received_by,
        p.payment_date,
        p.settlement_status,
        p.reference_number,
        p.note,
        p.created_at
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      INNER JOIN vendors v ON p.vendor_id = v.id
      INNER JOIN executives e ON p.executive_id = e.id
      WHERE p.id = ?
      LIMIT 1
      `,
      [paymentResult.insertId]
    );

    return sendSuccess(res, "Payment recorded successfully", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const getPaymentsByOrder = async (req, res, next) => {
  try {
    const loginUserId = req.user.id;
    const loginUserRole = req.user.role;
    const { orderId } = req.params;

    const [orderRows] = await pool.query(
      `
      SELECT id, executive_id
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [orderId]
    );

    if (orderRows.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    if (
      loginUserRole === "executive" &&
      orderRows[0].executive_id !== loginUserId
    ) {
      return sendError(res, "You can only view payments for your own orders", 403);
    }

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.payment_number,
        p.order_id,
        p.vendor_id,
        v.shop_name,
        p.executive_id,
        e.full_name AS executive_name,
        p.payment_mode,
        p.amount_received,
        p.received_by,
        p.payment_date,
        p.settlement_status,
        p.reference_number,
        p.note,
        p.created_at
      FROM payments p
      INNER JOIN vendors v ON p.vendor_id = v.id
      INNER JOIN executives e ON p.executive_id = e.id
      WHERE p.order_id = ?
      ORDER BY p.id DESC
      `,
      [orderId]
    );

    return sendSuccess(res, "Payments fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getMyDueOrders = async (req, res, next) => {
  try {
    const executiveId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.vendor_id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.phone AS vendor_phone,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.payment_status,
        o.status,
        o.approved_at,
        o.assigned_at,
        o.delivered_at,
        o.created_at
      FROM orders o
      INNER JOIN vendors v ON o.vendor_id = v.id
      WHERE o.executive_id = ?
        AND o.status IN ('approved', 'assigned', 'delivered')
        AND o.due_amount > 0
      ORDER BY o.id DESC
      `,
      [executiveId]
    );

    return sendSuccess(res, "My due orders fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getAllDueOrdersForAdmin = async (req, res, next) => {
  try {
    const { executive_id, area_id, search } = req.query;

    let sql = `
      SELECT
        o.id,
        o.order_number,
        o.vendor_id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.phone AS vendor_phone,
        o.executive_id,
        e.executive_code,
        e.full_name AS executive_name,
        o.area_id,
        a.area_name,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.payment_status,
        o.status,
        o.approved_at,
        o.assigned_at,
        o.delivered_at,
        o.created_at
      FROM orders o
      INNER JOIN vendors v ON o.vendor_id = v.id
      INNER JOIN executives e ON o.executive_id = e.id
      INNER JOIN areas a ON o.area_id = a.id
      WHERE o.status IN ('approved', 'assigned', 'delivered')
        AND o.due_amount > 0
    `;

    const values = [];

    if (executive_id) {
      sql += ` AND o.executive_id = ?`;
      values.push(executive_id);
    }

    if (area_id) {
      sql += ` AND o.area_id = ?`;
      values.push(area_id);
    }

    if (search) {
      sql += ` AND (
        o.order_number LIKE ?
        OR v.shop_name LIKE ?
        OR v.owner_name LIKE ?
        OR e.full_name LIKE ?
        OR v.vendor_code LIKE ?
      )`;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY o.id DESC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "All due orders fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getPaymentSummaryForAdmin = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_payment_entries,
        COALESCE(SUM(amount_received), 0) AS total_received_amount,
        COALESCE(SUM(CASE WHEN payment_mode = 'cash' THEN amount_received ELSE 0 END), 0) AS total_cash_received,
        COALESCE(SUM(CASE WHEN payment_mode = 'online' THEN amount_received ELSE 0 END), 0) AS total_online_received,
        COALESCE(SUM(CASE WHEN settlement_status = 'pending' THEN amount_received ELSE 0 END), 0) AS pending_cash_settlement
      FROM payments
      `
    );

    return sendSuccess(res, "Payment summary fetched successfully", rows[0]);
  } catch (error) {
    next(error);
  }
};