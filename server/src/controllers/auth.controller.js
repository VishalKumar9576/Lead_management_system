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
      [phone],
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
      200,
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
      [phone],
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
      200,
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
        [req.user.id],
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
        [req.user.id],
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

export const executiveRegister = async (req, res, next) => {
  try {
    const { full_name, phone, email, password } = req.body;

    if (!full_name || !phone || !password) {
      return sendError(res, "Full name, phone and password are required", 400);
    }

    const [existingPhone] = await pool.query(
      `SELECT id FROM executives WHERE phone = ? LIMIT 1`,
      [phone],
    );

    if (existingPhone.length > 0) {
      return sendError(res, "Executive phone already exists", 409);
    }

    if (email) {
      const [existingEmail] = await pool.query(
        `SELECT id FROM executives WHERE email = ? LIMIT 1`,
        [email],
      );
      if (existingEmail.length > 0) {
        return sendError(res, "Executive email already exists", 409);
      }
    }

    // generate a simple executive code if not provided
    const executive_code = `EX${Date.now().toString().slice(-6)}`;

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO executives (
        executive_code,
        full_name,
        phone,
        email,
        password_hash,
        commission_percent,
        status,
        joined_date
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
      `,
      [executive_code, full_name, phone, email || null, password_hash, 20],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        executive_code,
        full_name,
        phone,
        email,
        commission_percent,
        status,
        joined_date,
        created_at
      FROM executives
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    return sendSuccess(res, "Registration successful", rows[0], 201);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { role = "executive" } = req.body;

    if (role === "admin") {
      const { full_name, phone, email, password } = req.body;

      if (!full_name || !phone || !password) {
        return sendError(
          res,
          "Full name, phone and password are required",
          400,
        );
      }

      const [existingPhone] = await pool.query(
        `SELECT id FROM admins WHERE phone = ? LIMIT 1`,
        [phone],
      );

      if (existingPhone.length > 0) {
        return sendError(res, "Admin phone already exists", 409);
      }

      if (email) {
        const [existingEmail] = await pool.query(
          `SELECT id FROM admins WHERE email = ? LIMIT 1`,
          [email],
        );
        if (existingEmail.length > 0) {
          return sendError(res, "Admin email already exists", 409);
        }
      }

      const password_hash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `
        INSERT INTO admins (
          full_name,
          phone,
          email,
          password_hash,
          role,
          is_active
        )
        VALUES (?, ?, ?, ?, 'admin', TRUE)
        `,
        [full_name, phone, email || null, password_hash],
      );

      const [rows] = await pool.query(
        `SELECT id, full_name, phone, email, role, is_active, created_at FROM admins WHERE id = ? LIMIT 1`,
        [result.insertId],
      );

      return sendSuccess(res, "Admin registration successful", rows[0], 201);
    }

    // fallback to executive registration
    return executiveRegister(req, res, next);
  } catch (error) {
    next(error);
  }
};
