import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const adminLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return sendError(res, "Phone and password are required", 400);
    }

    const [rows] = await pool.query(
      `
      SELECT id, full_name, phone, email, password_hash, role, is_active
      FROM admins
      WHERE phone = ?
      LIMIT 1
      `,
      [phone]
    );

    if (rows.length === 0) {
      return sendError(res, "Invalid phone or password", 401);
    }

    const admin = rows[0];

    if (!admin.is_active) {
      return sendError(res, "Admin account is inactive", 403);
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return sendError(res, "Invalid phone or password", 401);
    }

    const token = generateToken({
      id: admin.id,
      role: "admin",
      adminRole: admin.role,
    });

    return sendSuccess(
      res,
      "Admin login successful",
      {
        token,
        user: {
          id: admin.id,
          full_name: admin.full_name,
          phone: admin.phone,
          email: admin.email,
          role: "admin",
          adminRole: admin.role,
        },
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const executiveLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return sendError(res, "Phone and password are required", 400);
    }

    const [rows] = await pool.query(
      `
      SELECT id, executive_code, full_name, phone, email, password_hash, commission_percent, status
      FROM executives
      WHERE phone = ?
      LIMIT 1
      `,
      [phone]
    );

    if (rows.length === 0) {
      return sendError(res, "Invalid phone or password", 401);
    }

    const executive = rows[0];

    if (executive.status !== "active") {
      return sendError(res, `Executive account is ${executive.status}`, 403);
    }

    const isMatch = await bcrypt.compare(password, executive.password_hash);

    if (!isMatch) {
      return sendError(res, "Invalid phone or password", 401);
    }

    const token = generateToken({
      id: executive.id,
      role: "executive",
    });

    return sendSuccess(
      res,
      "Executive login successful",
      {
        token,
        user: {
          id: executive.id,
          executive_code: executive.executive_code,
          full_name: executive.full_name,
          phone: executive.phone,
          email: executive.email,
          role: "executive",
          commission_percent: executive.commission_percent,
          status: executive.status,
        },
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const [rows] = await pool.query(
        `
        SELECT id, full_name, phone, email, role, is_active, created_at
        FROM admins
        WHERE id = ?
        LIMIT 1
        `,
        [req.user.id]
      );

      if (rows.length === 0) {
        return sendError(res, "Admin not found", 404);
      }

      return sendSuccess(res, "Profile fetched successfully", {
        user: {
          ...rows[0],
          roleType: "admin",
        },
      });
    }

    if (req.user.role === "executive") {
      const [rows] = await pool.query(
        `
        SELECT id, executive_code, full_name, phone, email, commission_percent, status, joined_date, created_at
        FROM executives
        WHERE id = ?
        LIMIT 1
        `,
        [req.user.id]
      );

      if (rows.length === 0) {
        return sendError(res, "Executive not found", 404);
      }

      return sendSuccess(res, "Profile fetched successfully", {
        user: {
          ...rows[0],
          roleType: "executive",
        },
      });
    }

    return sendError(res, "Invalid user role", 400);
  } catch (error) {
    next(error);
  }
};