import pool from "../config/db.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createArea = async (req, res, next) => {
  try {
    const { area_name, area_code, city, state, pincode } = req.body;

    if (!area_name || !area_code) {
      return sendError(res, "Area name and area code are required", 400);
    }

    const [existingRows] = await pool.query(
      `SELECT id FROM areas WHERE area_code = ? LIMIT 1`,
      [area_code]
    );

    if (existingRows.length > 0) {
      return sendError(res, "Area code already exists", 409);
    }

    const [result] = await pool.query(
      `
      INSERT INTO areas (
        area_name,
        area_code,
        city,
        state,
        pincode,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, TRUE)
      `,
      [area_name, area_code, city || null, state || null, pincode || null]
    );

    const [rows] = await pool.query(
      `SELECT * FROM areas WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return sendSuccess(res, "Area created successfully", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const getAllAreas = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, area_name, area_code, city, state, pincode, is_active, created_at
      FROM areas
      ORDER BY id DESC
      `
    );

    return sendSuccess(res, "Areas fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};


export const getAreaCoverageStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.area_name,
        a.area_code,
        a.city,
        a.state,
        a.pincode,
        a.is_active,
        a.created_at,

        COUNT(DISTINCT ea.executive_id) AS assigned_executives,
        COUNT(DISTINCT v.id) AS total_vendors,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(o.final_amount), 0) AS total_sales,
        COALESCE(SUM(o.paid_amount), 0) AS paid_amount,
        COALESCE(SUM(o.due_amount), 0) AS due_amount,
        SUM(CASE WHEN o.status = 'pending_approval' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders
      FROM areas a
      LEFT JOIN executive_areas ea
        ON ea.area_id = a.id AND ea.is_active = TRUE
      LEFT JOIN vendors v
        ON v.area_id = a.id
      LEFT JOIN orders o
        ON o.area_id = a.id
      GROUP BY
        a.id,
        a.area_name,
        a.area_code,
        a.city,
        a.state,
        a.pincode,
        a.is_active,
        a.created_at
      ORDER BY a.id DESC
      `
    );

    return sendSuccess(res, "Area coverage stats fetched successfully", rows);
  } catch (error) {
    next(error);
  }
};