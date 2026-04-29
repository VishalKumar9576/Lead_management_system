import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { sendError, sendSuccess } from "../utils/response.js";

const uploadBufferToCloudinary = (buffer, folder = "sales-management/vendors") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const createVendor = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const {
      vendor_code,
      area_id,
      owner_name,
      shop_name,
      email,
      phone,
      alternate_phone,
      gst_number,
      shop_address,
      landmark,
      pincode,
      onboarding_date,
      notes,
    } = req.body;

    if (!vendor_code || !area_id || !owner_name || !shop_name || !phone || !shop_address) {
      return sendError(
        res,
        "Vendor code, area id, owner name, shop name, phone and shop address are required",
        400
      );
    }

    const [assignedAreaRows] = await pool.query(
      `
      SELECT id
      FROM executive_areas
      WHERE executive_id = ? AND area_id = ? AND is_active = TRUE
      LIMIT 1
      `,
      [executiveId, area_id]
    );

    if (assignedAreaRows.length === 0) {
      return sendError(
        res,
        "You can only create vendors in your assigned areas",
        403
      );
    }

    const [existingCodeRows] = await pool.query(
      `SELECT id FROM vendors WHERE vendor_code = ? LIMIT 1`,
      [vendor_code]
    );

    if (existingCodeRows.length > 0) {
      return sendError(res, "Vendor code already exists", 409);
    }

    const [existingPhoneRows] = await pool.query(
      `SELECT id FROM vendors WHERE phone = ? LIMIT 1`,
      [phone]
    );

    if (existingPhoneRows.length > 0) {
      return sendError(res, "Vendor phone already exists", 409);
    }

    let shopImageUrl = null;
    let shopImagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      shopImageUrl = uploadResult.secure_url;
      shopImagePublicId = uploadResult.public_id;
    }

    const [result] = await pool.query(
      `
      INSERT INTO vendors (
        vendor_code,
        executive_id,
        area_id,
        owner_name,
        shop_name,
        email,
        phone,
        alternate_phone,
        gst_number,
        shop_address,
        landmark,
        pincode,
        shop_image_url,
        shop_image_public_id,
        status,
        onboarding_date,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
      `,
      [
        vendor_code,
        executiveId,
        area_id,
        owner_name,
        shop_name,
        email || null,
        phone,
        alternate_phone || null,
        gst_number || null,
        shop_address,
        landmark || null,
        pincode || null,
        shopImageUrl,
        shopImagePublicId,
        onboarding_date || null,
        notes || null,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        v.id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.email,
        v.phone,
        v.alternate_phone,
        v.gst_number,
        v.shop_address,
        v.landmark,
        v.pincode,
        v.shop_image_url,
        v.shop_image_public_id,
        v.status,
        v.onboarding_date,
        v.notes,
        v.created_at,
        v.executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        v.area_id,
        a.area_name,
        a.area_code,
        a.city,
        a.state
      FROM vendors v
      INNER JOIN executives e ON v.executive_id = e.id
      INNER JOIN areas a ON v.area_id = a.id
      WHERE v.id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return sendSuccess(res, "Vendor created successfully", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const getMyVendors = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const { area_id, status, search } = req.query;

    let sql = `
      SELECT
        v.id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.email,
        v.phone,
        v.gst_number,
        v.shop_address,
        v.shop_image_url,
        v.status,
        v.onboarding_date,
        v.created_at,
        v.area_id,
        a.area_name,
        a.area_code
      FROM vendors v
      INNER JOIN areas a ON v.area_id = a.id
      WHERE v.executive_id = ?
    `;

    const values = [executiveId];

    if (area_id) {
      sql += ` AND v.area_id = ?`;
      values.push(area_id);
    }

    if (status) {
      sql += ` AND v.status = ?`;
      values.push(status);
    }

    if (search) {
      sql += ` AND (
        v.owner_name LIKE ?
        OR v.shop_name LIKE ?
        OR v.phone LIKE ?
        OR v.vendor_code LIKE ?
      )`;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY v.id DESC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "Total vendors fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getMyVendorById = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        v.id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.email,
        v.phone,
        v.alternate_phone,
        v.gst_number,
        v.shop_address,
        v.landmark,
        v.pincode,
        v.shop_image_url,
        v.shop_image_public_id,
        v.status,
        v.onboarding_date,
        v.notes,
        v.created_at,
        v.updated_at,
        v.executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        v.area_id,
        a.area_name,
        a.area_code,
        a.city,
        a.state
      FROM vendors v
      INNER JOIN executives e ON v.executive_id = e.id
      INNER JOIN areas a ON v.area_id = a.id
      WHERE v.id = ? AND v.executive_id = ?
      LIMIT 1
      `,
      [id, executiveId]
    );

    if (rows.length === 0) {
      return sendError(res, "Vendor not found", 404);
    }

    return sendSuccess(res, "Vendor details fetched successfully", rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getAllVendorsForAdmin = async (req, res, next) => {
  try {
    const { executive_id, area_id, status, search } = req.query;

    let sql = `
      SELECT
        v.id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.email,
        v.phone,
        v.shop_image_url,
        v.status,
        v.onboarding_date,
        v.created_at,
        e.id AS executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        a.id AS area_id,
        a.area_name,
        a.area_code
      FROM vendors v
      INNER JOIN executives e ON v.executive_id = e.id
      INNER JOIN areas a ON v.area_id = a.id
      WHERE 1 = 1
    `;

    const values = [];

    if (executive_id) {
      sql += ` AND v.executive_id = ?`;
      values.push(executive_id);
    }

    if (area_id) {
      sql += ` AND v.area_id = ?`;
      values.push(area_id);
    }

    if (status) {
      sql += ` AND v.status = ?`;
      values.push(status);
    }

    if (search) {
      sql += ` AND (
        v.owner_name LIKE ?
        OR v.shop_name LIKE ?
        OR v.phone LIKE ?
        OR v.vendor_code LIKE ?
        OR e.full_name LIKE ?
      )`;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY v.id DESC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "All vendors fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getVendorByIdForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        v.id,
        v.vendor_code,
        v.owner_name,
        v.shop_name,
        v.email,
        v.phone,
        v.alternate_phone,
        v.gst_number,
        v.shop_address,
        v.landmark,
        v.pincode,
        v.shop_image_url,
        v.shop_image_public_id,
        v.status,
        v.onboarding_date,
        v.notes,
        v.created_at,
        v.updated_at,
        e.id AS executive_id,
        e.full_name AS executive_name,
        e.executive_code,
        e.phone AS executive_phone,
        a.id AS area_id,
        a.area_name,
        a.area_code,
        a.city,
        a.state
      FROM vendors v
      INNER JOIN executives e ON v.executive_id = e.id
      INNER JOIN areas a ON v.area_id = a.id
      WHERE v.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, "Vendor not found", 404);
    }

    return sendSuccess(res, "Vendor details fetched successfully", rows[0]);
  } catch (error) {
    next(error);
  }
};



export const updateMyVendor = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const { id } = req.params;

    const {
      owner_name,
      shop_name,
      email,
      phone,
      alternate_phone,
      gst_number,
      shop_address,
      landmark,
      pincode,
      status,
      onboarding_date,
      notes,
    } = req.body;

    const [checkRows] = await pool.query(
      `SELECT * FROM vendors WHERE id = ? AND executive_id = ? LIMIT 1`,
      [id, executiveId]
    );

    if (checkRows.length === 0) {
      return sendError(res, "Vendor not found", 404);
    }

    const oldVendor = checkRows[0];

    let shopImageUrl = oldVendor.shop_image_url;
    let shopImagePublicId = oldVendor.shop_image_public_id;

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      shopImageUrl = uploadResult.secure_url;
      shopImagePublicId = uploadResult.public_id;
    }

    await pool.query(
      `
      UPDATE vendors
      SET
        owner_name = ?,
        shop_name = ?,
        email = ?,
        phone = ?,
        alternate_phone = ?,
        gst_number = ?,
        shop_address = ?,
        landmark = ?,
        pincode = ?,
        shop_image_url = ?,
        shop_image_public_id = ?,
        status = ?,
        onboarding_date = ?,
        notes = ?
      WHERE id = ? AND executive_id = ?
      `,
      [
        owner_name || oldVendor.owner_name,
        shop_name || oldVendor.shop_name,
        email ?? oldVendor.email,
        phone || oldVendor.phone,
        alternate_phone ?? oldVendor.alternate_phone,
        gst_number ?? oldVendor.gst_number,
        shop_address || oldVendor.shop_address,
        landmark ?? oldVendor.landmark,
        pincode ?? oldVendor.pincode,
        shopImageUrl,
        shopImagePublicId,
        status || oldVendor.status,
        onboarding_date || oldVendor.onboarding_date,
        notes ?? oldVendor.notes,
        id,
        executiveId,
      ]
    );

    return sendSuccess(res, "Vendor updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteMyVendor = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const { id } = req.params;

    const [checkOrders] = await pool.query(
      `SELECT id FROM orders WHERE vendor_id=? LIMIT 1`,
      [id]
    );

    if (checkOrders.length > 0) {
      return sendError(
        res,
        "Vendor has orders. Cannot delete. Make inactive instead.",
        400
      );
    }

    await pool.query(
      `DELETE FROM vendors WHERE id=? AND executive_id=?`,
      [id, executiveId]
    );

    return sendSuccess(res, "Vendor deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getMyVendorOrders = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        order_number,
        status,
        subtotal_amount,
        discount_percent,
        discount_amount,
        final_amount,
        paid_amount,
        due_amount,
        payment_status,
        order_note,
        created_at,
        approved_at,
        delivered_at
      FROM orders
      WHERE vendor_id = ? AND executive_id = ?
      ORDER BY id DESC
      `,
      [id, executiveId]
    );

    return sendSuccess(res, "Vendor orders fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getMyVendorPayments = async (req, res, next) => {
  try {
    const executiveId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.payment_number,
        p.order_id,
        o.order_number,
        p.payment_mode,
        p.amount_received,
        p.received_by,
        p.payment_date,
        p.settlement_status,
        p.reference_number,
        p.note,
        p.created_at
      FROM payments p
      INNER JOIN orders o ON o.id = p.order_id
      WHERE o.vendor_id = ? AND o.executive_id = ?
      ORDER BY p.id DESC
      `,
      [id, executiveId]
    );

    return sendSuccess(res, "Vendor payments fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};