import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const categories = [
  "Face Wash",
  "Soap",
  "Shampoo",
  "Hair Oil",
  "Body Lotion",
  "Face Cream",
  "Scrub",
  "Sunscreen",
  "Talcum Powder",
  "Body Wash",
];

const brands = [
  "Ponds",
  "Dove",
  "VLCC",
  "Nivea",
  "Himalaya",
  "Garnier",
  "Clinic Plus",
  "Parachute",
  "Vaseline",
  "Biotique",
];

const sizes = [
  "20ml",
  "50ml",
  "100ml",
  "150ml",
  "200ml",
  "250ml",
  "500ml",
  "1L",
  "50g",
  "100g",
  "125g",
  "250g",
];

const products = [];

let counter = 1;

for (const category of categories) {
  for (const brand of brands) {
    for (let i = 0; i < 3; i++) {
      const size = sizes[(counter + i) % sizes.length];
      const mrp = 50 + ((counter * 17) % 450);
      const sellingPrice = Math.max(35, mrp - ((counter * 3) % 60));
      const stock = 10 + ((counter * 7) % 190);

      products.push({
        product_code: `BP${String(counter).padStart(4, "0")}`,
        product_name: `${brand} ${category} ${size}`,
        brand,
        category,
        unit_label: size,
        mrp,
        selling_price: sellingPrice,
        stock_qty: stock,
      });

      counter++;
    }
  }
}

const seedProducts = async () => {
  try {
    console.log(`Preparing to insert ${products.length} beauty products...`);

    for (const product of products) {
      await pool.query(
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, 3)
        ON DUPLICATE KEY UPDATE
          product_name = VALUES(product_name),
          brand = VALUES(brand),
          category = VALUES(category),
          unit_label = VALUES(unit_label),
          mrp = VALUES(mrp),
          selling_price = VALUES(selling_price),
          stock_qty = VALUES(stock_qty),
          is_active = TRUE
        `,
        [
          product.product_code,
          product.product_name,
          product.brand,
          product.category,
          product.unit_label,
          product.mrp,
          product.selling_price,
          product.stock_qty,
        ]
      );
    }

    console.log("Beauty products seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedProducts();