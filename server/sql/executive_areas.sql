CREATE TABLE IF NOT EXISTS executive_areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  executive_id INT NOT NULL,
  area_id INT NOT NULL,
  assigned_by_admin_id INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  UNIQUE KEY unique_executive_area (executive_id, area_id),

  CONSTRAINT fk_exec_areas_executive
    FOREIGN KEY (executive_id) REFERENCES executives(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_exec_areas_area
    FOREIGN KEY (area_id) REFERENCES areas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_exec_areas_admin
    FOREIGN KEY (assigned_by_admin_id) REFERENCES admins(id)
    ON DELETE SET NULL
);