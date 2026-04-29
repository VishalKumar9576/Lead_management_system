CREATE TABLE IF NOT EXISTS executives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  executive_code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  pan_number VARCHAR(20),
  aadhar_number VARCHAR(20),

  bank_account_name VARCHAR(150),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_name VARCHAR(100),

  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',

  joined_date DATE,
  notes TEXT,

  created_by_admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_executive_created_by_admin
    FOREIGN KEY (created_by_admin_id) REFERENCES admins(id)
    ON DELETE SET NULL
);