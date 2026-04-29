CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_code VARCHAR(50) NOT NULL UNIQUE,

  executive_id INT NOT NULL,
  area_id INT NOT NULL,

  owner_name VARCHAR(150) NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  gst_number VARCHAR(30),

  shop_address TEXT NOT NULL,
  landmark VARCHAR(150),
  pincode VARCHAR(10),

  shop_image_url TEXT,
  shop_image_public_id VARCHAR(255),

  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  onboarding_date DATE,
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_vendors_executive
    FOREIGN KEY (executive_id) REFERENCES executives(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_vendors_area
    FOREIGN KEY (area_id) REFERENCES areas(id)
    ON DELETE RESTRICT
);