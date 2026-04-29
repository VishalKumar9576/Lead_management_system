import pool from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createProduct = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const {
      product_code,
      product_name,
      brand,
      category,
      unit_label,
      mrp,
      selling_price,
      stock_qty,
    } = req.body;

    if (
      !product_code ||
      !product_name ||
      !brand ||
      !category ||
      !unit_label ||
      mrp === undefined ||
      selling_price === undefined ||
      stock_qty === undefined
    ) {
      return sendError(
        res,
        "Product code, name, brand, category, unit label, mrp, selling price and stock qty are required",
        400
      );
    }

    const numericMrp = Number(mrp);
    const numericSellingPrice = Number(selling_price);
    const numericStockQty = Number(stock_qty);

    if (
      Number.isNaN(numericMrp) ||
      Number.isNaN(numericSellingPrice) ||
      Number.isNaN(numericStockQty)
    ) {
      return sendError(res, "MRP, selling price and stock qty must be valid numbers", 400);
    }

    if (numericMrp < 0 || numericSellingPrice < 0 || numericStockQty < 0) {
      return sendError(res, "MRP, selling price and stock qty cannot be negative", 400);
    }

    const [existingCodeRows] = await pool.query(
      `SELECT id FROM products WHERE product_code = ? LIMIT 1`,
      [product_code]
    );

    if (existingCodeRows.length > 0) {
      return sendError(res, "Product code already exists", 409);
    }

    const [result] = await pool.query(
      `
      INSERT INTO products (
        product_code,
        product_name,
        brand,
        category,
        unit_label,
        mrp,
        selling_price,
        stock_qty,
        is_active,
        created_by_admin_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
      `,
      [
        product_code,
        product_name,
        brand,
        category,
        unit_label,
        numericMrp,
        numericSellingPrice,
        numericStockQty,
        adminId,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.product_code,
        p.product_name,
        p.brand,
        p.category,
        p.unit_label,
        p.mrp,
        p.selling_price,
        p.stock_qty,
        p.is_active,
        p.created_at,
        a.full_name AS created_by_admin_name
      FROM products p
      LEFT JOIN admins a ON p.created_by_admin_id = a.id
      WHERE p.id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return sendSuccess(res, "Product created successfully", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, brand, is_active } = req.query;

    let sql = `
      SELECT
        id,
        product_code,
        product_name,
        brand,
        category,
        unit_label,
        mrp,
        selling_price,
        stock_qty,
        is_active,
        created_at
      FROM products
      WHERE 1 = 1
    `;
    const values = [];

    if (search) {
      sql += ` AND (
        product_code LIKE ?
        OR product_name LIKE ?
        OR brand LIKE ?
        OR category LIKE ?
      )`;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern);
    }

    if (category) {
      sql += ` AND category = ?`;
      values.push(category);
    }

    if (brand) {
      sql += ` AND brand = ?`;
      values.push(brand);
    }

    if (is_active !== undefined) {
      sql += ` AND is_active = ?`;
      values.push(is_active === "true" ? 1 : 0);
    }

    sql += ` ORDER BY id DESC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "Products fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const getActiveProductsForExecutive = async (req, res, next) => {
  try {
    const { search, category, brand } = req.query;

    let sql = `
      SELECT
        id,
        product_code,
        product_name,
        brand,
        category,
        unit_label,
        mrp,
        selling_price,
        stock_qty
      FROM products
      WHERE is_active = TRUE
        AND stock_qty > 0
    `;
    const values = [];

    if (search) {
      sql += ` AND (
        product_code LIKE ?
        OR product_name LIKE ?
        OR brand LIKE ?
        OR category LIKE ?
      )`;
      const pattern = `%${search}%`;
      values.push(pattern, pattern, pattern, pattern);
    }

    if (category) {
      sql += ` AND category = ?`;
      values.push(category);
    }

    if (brand) {
      sql += ` AND brand = ?`;
      values.push(brand);
    }

    sql += ` ORDER BY product_name ASC`;

    const [rows] = await pool.query(sql, values);

    return sendSuccess(res, "Active products fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      brand,
      category,
      unit_label,
      mrp,
      selling_price,
      stock_qty,
      is_active,
    } = req.body;

    const [existingRows] = await pool.query(
      `SELECT id FROM products WHERE id = ? LIMIT 1`,
      [id]
    );

    if (existingRows.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    await pool.query(
      `
      UPDATE products
      SET
        product_name = COALESCE(?, product_name),
        brand = COALESCE(?, brand),
        category = COALESCE(?, category),
        unit_label = COALESCE(?, unit_label),
        mrp = COALESCE(?, mrp),
        selling_price = COALESCE(?, selling_price),
        stock_qty = COALESCE(?, stock_qty),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
      `,
      [
        product_name ?? null,
        brand ?? null,
        category ?? null,
        unit_label ?? null,
        mrp ?? null,
        selling_price ?? null,
        stock_qty ?? null,
        is_active ?? null,
        id,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        product_code,
        product_name,
        brand,
        category,
        unit_label,
        mrp,
        selling_price,
        stock_qty,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return sendSuccess(res, "Product updated successfully", rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existingRows] = await pool.query(
      `SELECT id FROM products WHERE id = ? LIMIT 1`,
      [id]
    );

    if (existingRows.length === 0) {
      return sendError(res, "Product not found", 404);
    }

    await pool.query(`DELETE FROM products WHERE id = ?`, [id]);

    return sendSuccess(res, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};