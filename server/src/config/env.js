import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load .env if present
dotenv.config();

// If some required env vars are missing (e.g., running locally without a .env),
// try to load defaults from server/.env.example so the app can run without
// changing other files. This does not write files; it only sets process.env
// values at runtime for any missing keys.
function loadExampleEnvIfNeeded() {
  const keysToCheck = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missing = keysToCheck.some((k) => process.env[k] === undefined);
  if (!missing) return;

  const candidates = [
    path.resolve(process.cwd(), ".env.example"),
    path.resolve(process.cwd(), "server", ".env.example"),
    path.resolve(process.cwd(), "..", ".env.example"),
  ];

  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, "utf8");
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const idx = trimmed.indexOf("=");
        if (idx === -1) return;
        const key = trimmed.slice(0, idx);
        let val = trimmed.slice(idx + 1);
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (process.env[key] === undefined) process.env[key] = val;
      });
      break;
    } catch (err) {
      // ignore read errors and continue
    }
  }
}

loadExampleEnvIfNeeded();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT || 3306,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

export default env;
