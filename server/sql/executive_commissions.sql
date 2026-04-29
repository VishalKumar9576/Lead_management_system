CREATE TABLE IF NOT EXISTS executive_commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  executive_id INT NOT NULL,
  order_id INT NOT NULL,

  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  sales_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

  status ENUM('pending', 'approved', 'paid') NOT NULL DEFAULT 'pending',
  remarks TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_commissions_executive
    FOREIGN KEY (executive_id) REFERENCES executives(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_commissions_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
);