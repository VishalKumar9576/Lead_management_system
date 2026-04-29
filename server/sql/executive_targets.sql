CREATE TABLE IF NOT EXISTS executive_targets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  executive_id INT NOT NULL,
  target_month TINYINT NOT NULL,
  target_year SMALLINT NOT NULL,

  target_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  achieved_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  pending_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

  created_by_admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_exec_target_month (executive_id, target_month, target_year),

  CONSTRAINT fk_targets_executive
    FOREIGN KEY (executive_id) REFERENCES executives(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_targets_admin
    FOREIGN KEY (created_by_admin_id) REFERENCES admins(id)
    ON DELETE SET NULL
);