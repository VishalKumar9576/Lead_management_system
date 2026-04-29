import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS db_status");

    res.status(200).json({
      success: true,
      message: "Server is running fine",
      data: {
        server: "ok",
        database: rows[0]?.db_status === 1 ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;