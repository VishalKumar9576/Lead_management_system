import pool from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

const generateOrderNumber = () => {
  return `ORD${Date.now()}`;
};

export const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const executiveId = req.user.id;

    const {
      vendor_id,
      discount_percent = 0,
      order_note = "",
      items,
    } = req.body;

    if (!vendor_id) {
      await connection.rollback();
      return sendError(res, "Vendor is required", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return sendError(res, "At least one product item is required", 400);
    }

    const numericDiscountPercent = Number(discount_percent);

    if (Number.isNaN(numericDiscountPercent) || numericDiscountPercent < 0) {
      await connection.rollback();
      return sendError(res, "Discount percent must be valid", 400);
    }

    // vendor validation
    const [vendorRows] = await connection.query(
      `
      SELECT
        v.id,
        v.area_id,
        v.executive_id,
        v.shop_name
      FROM vendors v
      WHERE v.id = ?
      LIMIT 1
      `,
      [vendor_id]
    );

    if (vendorRows.length === 0) {
      await connection.rollback();
      return sendError(res, "Vendor not found", 404);
    }

    const vendor = vendorRows[0];

    if (vendor.executive_id !== executiveId) {
      await connection.rollback();
      return sendError(res, "You can only create order for your vendor", 403);
    }

    // product ids
    const productIds = items.map((item) => item.product_id);

    const [products] = await connection.query(
  `
  SELECT
    id,
    product_name,
    brand,
    unit_label,
    selling_price,
    stock_qty,
    is_active
  FROM products
  WHERE id IN (?)
  FOR UPDATE
  `,
  [productIds]
);

    if (products.length !== productIds.length) {
      await connection.rollback();
      return sendError(res, "Some selected products not found", 400);
    }

    const productMap = new Map();
    products.forEach((p) => productMap.set(p.id, p));

    let subtotal = 0;
    const preparedItems = [];

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (!productMap.has(productId)) {
        await connection.rollback();
        return sendError(res, "Invalid product selected", 400);
      }

      if (Number.isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return sendError(res, "Quantity must be greater than zero", 400);
      }

      const product = productMap.get(productId);

      if (!product.is_active) {
        await connection.rollback();
        return sendError(
          res,
          `${product.product_name} is inactive`,
          400
        );
      }

      if (product.stock_qty < quantity) {
  await connection.rollback();
  return sendError(
    res,
    `Only ${product.stock_qty} available for ${product.product_name}`,
    400
  );
}

      const unitPrice = Number(product.selling_price);
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      preparedItems.push({
        product_id: product.id,
        product_name: product.product_name,
        brand: product.brand,
        unit_label: product.unit_label,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const discountAmount =
      (subtotal * numericDiscountPercent) / 100;

    const finalAmount = subtotal - discountAmount;

    const orderNumber = generateOrderNumber();

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (
        order_number,
        vendor_id,
        executive_id,
        area_id,
        status,
        subtotal_amount,
        discount_percent,
        discount_amount,
        final_amount,
        paid_amount,
        due_amount,
        payment_status,
        order_note,
        created_by_executive_id
      )
      VALUES (?, ?, ?, ?, 'pending_approval', ?, ?, ?, ?, 0, ?, 'unpaid', ?, ?)
      `,
      [
        orderNumber,
        vendor_id,
        executiveId,
        vendor.area_id,
        subtotal,
        numericDiscountPercent,
        discountAmount,
        finalAmount,
        finalAmount,
        order_note,
        executiveId,
      ]
    );

    const orderId = orderResult.insertId;

    for (const row of preparedItems) {
  await connection.query(
    `
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      brand,
      unit_label,
      quantity,
      unit_price,
      line_total
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      orderId,
      row.product_id,
      row.product_name,
      row.brand,
      row.unit_label,
      row.quantity,
      row.unit_price,
      row.line_total,
    ]
  );

  await connection.query(
    `
    UPDATE products
    SET stock_qty = stock_qty - ?
    WHERE id = ?
    `,
    [row.quantity, row.product_id]
  );
}

    await connection.commit();

    return sendSuccess(
      res,
      "Order created successfully",
      {
        order_id: orderId,
        order_number: orderNumber,
        vendor_name: vendor.shop_name,
        subtotal_amount: subtotal,
        discount_percent: numericDiscountPercent,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        items: preparedItems,
      },
      201
    );
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const executiveId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        v.shop_name,
        o.status,
        o.subtotal_amount,
        o.discount_percent,
        o.discount_amount,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.payment_status,
        o.created_at
      FROM orders o
      JOIN vendors v ON o.vendor_id = v.id
      WHERE o.executive_id = ?
      ORDER BY o.id DESC
      `,
      [executiveId]
    );

    return sendSuccess(res, "Orders fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getOrderItems = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        product_name,
        brand,
        unit_label,
        quantity,
        unit_price,
        line_total
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    return sendSuccess(res, "Order items fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};


export const getOrderInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loginUserId = req.user.id;
    const loginUserRole = req.user.role;

    const [orderRows] = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.vendor_id,
        o.executive_id,
        o.area_id,
        o.status,
        o.subtotal_amount,
        o.discount_percent,
        o.discount_amount,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.payment_status,
        o.order_note,
        o.created_at,

        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.email AS vendor_email,
        v.phone AS vendor_phone,
        v.alternate_phone,
        v.gst_number,
        v.shop_address,
        v.landmark,
        v.pincode,

        a.area_name,

        e.executive_code,
        e.full_name AS executive_name,
        e.email AS executive_email,
        e.phone AS executive_phone
      FROM orders o
      INNER JOIN vendors v ON o.vendor_id = v.id
      INNER JOIN areas a ON o.area_id = a.id
      INNER JOIN executives e ON o.executive_id = e.id
      WHERE o.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (orderRows.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    const order = orderRows[0];

    if (loginUserRole === "executive" && order.executive_id !== loginUserId) {
      return sendError(res, "You can only view invoice for your own order", 403);
    }

    const [items] = await pool.query(
      `
      SELECT
        id,
        product_id,
        product_name,
        brand,
        unit_label,
        quantity,
        unit_price,
        line_total
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    const [payments] = await pool.query(
      `
      SELECT
        id,
        payment_number,
        payment_mode,
        amount_received,
        received_by,
        payment_date,
        settlement_status,
        reference_number,
        note,
        created_at
      FROM payments
      WHERE order_id = ?
      ORDER BY id DESC
      `,
      [id]
    );

    return sendSuccess(res, "Invoice fetched successfully", {
      order,
      items,
      payments,
    });
  } catch (error) {
    next(error);
  }
};



export const getAllOrdersForAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let sql = `
      SELECT
        o.id,
        o.order_number,
        o.vendor_id,
        v.shop_name,
        v.owner_name,
        v.phone AS vendor_phone,
        o.executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        o.area_id,
        a.area_name,
        o.status,
        o.subtotal_amount,
        o.discount_percent,
        o.discount_amount,
        o.final_amount,
        o.paid_amount,
        o.due_amount,
        o.payment_status,
        o.order_note,
        o.rejection_reason,
        o.created_at,
        o.approved_at,
        o.assigned_at,
        o.delivered_at
      FROM orders o
      INNER JOIN vendors v ON o.vendor_id = v.id
      INNER JOIN executives e ON o.executive_id = e.id
      INNER JOIN areas a ON o.area_id = a.id
      WHERE 1=1
    `;

    const values = [];

    if (status) {
      sql += ` AND o.status = ?`;
      values.push(status);
    }

    if (search) {
      sql += `
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
      values.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY o.id DESC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "Admin orders fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const approveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const [orderRows] = await pool.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (orderRows.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    if (orderRows[0].status !== "pending_approval") {
      return sendError(res, "Only pending approval orders can be approved", 400);
    }

    await pool.query(
      `
      UPDATE orders
      SET
        status = 'approved',
        approved_by_admin_id = ?,
        approved_at = NOW(),
        rejection_reason = NULL
      WHERE id = ?
      `,
      [adminId, id]
    );

    return sendSuccess(res, "Order approved successfully");
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return sendError(res, "Rejection reason is required", 400);
    }

    const [orderRows] = await pool.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (orderRows.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    if (orderRows[0].status !== "pending_approval") {
      return sendError(res, "Only pending approval orders can be rejected", 400);
    }

    await pool.query(
      `
      UPDATE orders
      SET
        status = 'rejected',
        rejection_reason = ?
      WHERE id = ?
      `,
      [rejection_reason.trim(), id]
    );

    return sendSuccess(res, "Order rejected successfully");
  } catch (error) {
    next(error);
  }
};

export const assignOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orderRows] = await pool.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (orderRows.length === 0) {
      return sendError(res, "Order not found", 404);
    }

    if (orderRows[0].status !== "approved") {
      return sendError(res, "Only approved orders can be assigned", 400);
    }

    await pool.query(
      `
      UPDATE orders
      SET
        status = 'assigned',
        assigned_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    return sendSuccess(res, "Order assigned successfully");
  } catch (error) {
    next(error);
  }
};