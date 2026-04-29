CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_number VARCHAR(50) NOT NULL UNIQUE,

  order_id INT NOT NULL,
  vendor_id INT NOT NULL,
  executive_id INT NOT NULL,

  payment_mode ENUM('cash', 'online') NOT NULL,
  amount_received DECIMAL(12,2) NOT NULL DEFAULT 0.00,

  received_by ENUM('admin', 'executive') NOT NULL,
  payment_date DATETIME NOT NULL,

  settlement_status ENUM('pending', 'submitted', 'verified') DEFAULT 'pending',
  reference_number VARCHAR(100),
  note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_payments_vendor
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_payments_executive
    FOREIGN KEY (executive_id) REFERENCES executives(id)
    ON DELETE RESTRICT
);