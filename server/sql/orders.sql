CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,

  vendor_id INT NOT NULL,
  executive_id INT NOT NULL,
  area_id INT NOT NULL,

  status ENUM(
    'pending_approval',
    'approved',
    'rejected',
    'assigned',
    'delivered',
    'cancelled'
  ) NOT NULL DEFAULT 'pending_approval',

  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  final_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  due_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

  payment_status ENUM('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid',

  order_note TEXT,
  rejection_reason TEXT,

  created_by_executive_id INT NOT NULL,
  approved_by_admin_id INT NULL,

  approved_at DATETIME NULL,
  assigned_at DATETIME NULL,
  delivered_at DATETIME NULL,

  is_locked BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_orders_vendor
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_orders_executive
    FOREIGN KEY (executive_id) REFERENCES executives(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_orders_area
    FOREIGN KEY (area_id) REFERENCES areas(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_orders_created_by_exec
    FOREIGN KEY (created_by_executive_id) REFERENCES executives(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_orders_approved_by_admin
    FOREIGN KEY (approved_by_admin_id) REFERENCES admins(id)
    ON DELETE SET NULL
);