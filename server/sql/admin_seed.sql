INSERT INTO admins (
  full_name,
  phone,
  email,
  password_hash,
  role,
  is_active
)
VALUES (
  'Super Admin',
  '9999999999',
  'admin@salesmanagement.com',
  '$2b$10$gMxKK96ILWx2hW97qxBJROxhnkPDrKdYRPxYtKa44Q2OkUJ1tlx7K',
  'super_admin',
  TRUE
);