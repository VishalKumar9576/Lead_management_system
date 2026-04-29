USE sales_management;

SET SQL_SAFE_UPDATES = 0;

DROP PROCEDURE IF EXISTS seed_sales_demo_200;

DELIMITER $$

CREATE PROCEDURE seed_sales_demo_200()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE j INT DEFAULT 1;

  DECLARE v_admin_id INT DEFAULT NULL;
  DECLARE v_password_hash VARCHAR(255);

  DECLARE v_area_id INT;
  DECLARE v_exec_id INT;
  DECLARE v_vendor_id INT;
  DECLARE v_vendor_exec_id INT;
  DECLARE v_vendor_area_id INT;

  DECLARE v_order_id INT;
  DECLARE v_order_no VARCHAR(50);
  DECLARE v_status VARCHAR(30);
  DECLARE v_payment_status VARCHAR(20);
  DECLARE v_order_date DATETIME;

  DECLARE v_subtotal DECIMAL(12,2) DEFAULT 0;
  DECLARE v_discount_percent DECIMAL(5,2) DEFAULT 0;
  DECLARE v_discount_amount DECIMAL(12,2) DEFAULT 0;
  DECLARE v_final_amount DECIMAL(12,2) DEFAULT 0;
  DECLARE v_paid_amount DECIMAL(12,2) DEFAULT 0;
  DECLARE v_due_amount DECIMAL(12,2) DEFAULT 0;

  DECLARE v_product_count INT DEFAULT 0;
  DECLARE v_product_rn INT;
  DECLARE v_product_id INT;
  DECLARE v_product_name VARCHAR(150);
  DECLARE v_brand VARCHAR(100);
  DECLARE v_unit_label VARCHAR(50);
  DECLARE v_unit_price DECIMAL(10,2);
  DECLARE v_quantity INT;
  DECLARE v_line_total DECIMAL(12,2);
  DECLARE v_item_count INT;

  DECLARE v_payment_mode VARCHAR(20);
  DECLARE v_received_by VARCHAR(20);
  DECLARE v_settlement_status VARCHAR(20);

  SELECT id INTO v_admin_id
  FROM admins
  ORDER BY id
  LIMIT 1;

  SELECT password_hash INTO v_password_hash
  FROM executives
  ORDER BY id
  LIMIT 1;

  IF v_password_hash IS NULL THEN
    SET v_password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy';
  END IF;

  SET FOREIGN_KEY_CHECKS = 0;

  DELETE p
  FROM payments p
  INNER JOIN orders o ON p.order_id = o.id
  WHERE o.order_number LIKE 'DEMOORD%';

  DELETE FROM payments
  WHERE payment_number LIKE 'DEMOPAY%';

  DELETE oi
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE o.order_number LIKE 'DEMOORD%';

  DELETE FROM orders
  WHERE order_number LIKE 'DEMOORD%';

  DELETE FROM vendors
  WHERE vendor_code LIKE 'DEMOV%';

  DELETE FROM executive_areas
  WHERE executive_id IN (
    SELECT id FROM executives WHERE executive_code LIKE 'DEMOEXEC%'
  )
  OR area_id IN (
    SELECT id FROM areas WHERE area_code LIKE 'DEMOAREA%'
  );

  DELETE FROM executives
  WHERE executive_code LIKE 'DEMOEXEC%';

  DELETE FROM areas
  WHERE area_code LIKE 'DEMOAREA%';

  SET FOREIGN_KEY_CHECKS = 1;

  CREATE TEMPORARY TABLE tmp_demo_products (
    rn INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    product_name VARCHAR(150),
    brand VARCHAR(100),
    unit_label VARCHAR(50),
    selling_price DECIMAL(10,2)
  ) ENGINE=MEMORY;

  INSERT INTO tmp_demo_products (
    product_id,
    product_name,
    brand,
    unit_label,
    selling_price
  )
  SELECT
    id,
    product_name,
    brand,
    unit_label,
    selling_price
  FROM products
  WHERE is_active = 1
    AND selling_price > 0
  ORDER BY id
  LIMIT 120;

  SELECT COUNT(*) INTO v_product_count FROM tmp_demo_products;

  IF v_product_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No active products found. Add active products first.';
  END IF;

  CREATE TEMPORARY TABLE tmp_order_lines (
    product_id INT,
    product_name VARCHAR(150),
    brand VARCHAR(100),
    unit_label VARCHAR(50),
    quantity INT,
    unit_price DECIMAL(10,2),
    line_total DECIMAL(12,2)
  ) ENGINE=MEMORY;

  SET i = 1;

  WHILE i <= 10 DO
    INSERT INTO areas (
      area_name,
      area_code,
      city,
      state,
      pincode,
      is_active
    )
    VALUES (
      CONCAT(
        ELT(
          i,
          'Sitapura',
          'Mansarovar',
          'Malviya Nagar',
          'Vaishali Nagar',
          'Jagatpura',
          'Sanganer',
          'C-Scheme',
          'Tonk Road',
          'Ajmer Road',
          'Jhotwara'
        ),
        ' Demo'
      ),
      CONCAT('DEMOAREA', LPAD(i, 2, '0')),
      'Jaipur',
      'Rajasthan',
      CONCAT('3020', LPAD(i, 2, '0')),
      TRUE
    );

    SET i = i + 1;
  END WHILE;

  SET i = 1;

  WHILE i <= 10 DO
    INSERT INTO executives (
      executive_code,
      full_name,
      phone,
      email,
      password_hash,
      pan_number,
      aadhar_number,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
      bank_name,
      commission_percent,
      status,
      joined_date,
      notes,
      created_by_admin_id
    )
    VALUES (
      CONCAT('DEMOEXEC', LPAD(i, 3, '0')),
      ELT(
        i,
        'Rahul Kumar Demo',
        'Amit Singh Demo',
        'Vikash Sharma Demo',
        'Suresh Yadav Demo',
        'Manish Gupta Demo',
        'Rohit Verma Demo',
        'Ankit Raj Demo',
        'Pawan Meena Demo',
        'Nitin Saini Demo',
        'Deepak Jain Demo'
      ),
      CONCAT('85000000', LPAD(i, 2, '0')),
      CONCAT('demoexec', i, '@test.com'),
      v_password_hash,
      CONCAT('ABCDE12', LPAD(i, 2, '0'), 'F'),
      CONCAT('9000000000', LPAD(i, 2, '0')),
      ELT(
        i,
        'Rahul Kumar Demo',
        'Amit Singh Demo',
        'Vikash Sharma Demo',
        'Suresh Yadav Demo',
        'Manish Gupta Demo',
        'Rohit Verma Demo',
        'Ankit Raj Demo',
        'Pawan Meena Demo',
        'Nitin Saini Demo',
        'Deepak Jain Demo'
      ),
      CONCAT('9876543210', LPAD(i, 2, '0')),
      CONCAT('HDFC000', LPAD(i, 4, '0')),
      'HDFC Bank',
      10 + (i * 2),
      'active',
      DATE_SUB(CURDATE(), INTERVAL (60 + i) DAY),
      'Demo executive for sales filter testing',
      v_admin_id
    );

    SET i = i + 1;
  END WHILE;

  SET i = 1;

  WHILE i <= 10 DO
    SELECT id INTO v_exec_id
    FROM executives
    WHERE executive_code = CONCAT('DEMOEXEC', LPAD(i, 3, '0'))
    LIMIT 1;

    SELECT id INTO v_area_id
    FROM areas
    WHERE area_code = CONCAT('DEMOAREA', LPAD(i, 2, '0'))
    LIMIT 1;

    INSERT INTO executive_areas (
      executive_id,
      area_id,
      assigned_by_admin_id,
      is_active
    )
    VALUES (
      v_exec_id,
      v_area_id,
      v_admin_id,
      TRUE
    );

    SET i = i + 1;
  END WHILE;

  SET i = 1;

  WHILE i <= 50 DO
    SELECT id INTO v_exec_id
    FROM executives
    WHERE executive_code = CONCAT('DEMOEXEC', LPAD(((i - 1) MOD 10) + 1, 3, '0'))
    LIMIT 1;

    SELECT id INTO v_area_id
    FROM areas
    WHERE area_code = CONCAT('DEMOAREA', LPAD(((i - 1) MOD 10) + 1, 2, '0'))
    LIMIT 1;

    INSERT INTO vendors (
      vendor_code,
      executive_id,
      area_id,
      owner_name,
      shop_name,
      email,
      phone,
      alternate_phone,
      gst_number,
      shop_address,
      landmark,
      pincode,
      status,
      onboarding_date,
      notes
    )
    VALUES (
      CONCAT('DEMOV', LPAD(i, 3, '0')),
      v_exec_id,
      v_area_id,
      CONCAT('Owner ', LPAD(i, 3, '0')),
      CONCAT('Demo Kirana Store ', LPAD(i, 3, '0')),
      CONCAT('demovendor', i, '@test.com'),
      CONCAT('860000', LPAD(i, 4, '0')),
      CONCAT('870000', LPAD(i, 4, '0')),
      CONCAT('08ABCDE', LPAD(i, 4, '0'), 'Z1'),
      CONCAT('Shop No ', i, ', Demo Market, Jaipur'),
      CONCAT('Near Demo Landmark ', i),
      CONCAT('3020', LPAD(((i - 1) MOD 10) + 1, 2, '0')),
      'active',
      DATE_SUB(CURDATE(), INTERVAL (50 - (i MOD 30)) DAY),
      'Demo vendor for sales/order/payment filter testing'
    );

    SET i = i + 1;
  END WHILE;

  SET i = 1;

  WHILE i <= 200 DO
    DELETE FROM tmp_order_lines;

    SELECT
      v.id,
      v.executive_id,
      v.area_id
    INTO
      v_vendor_id,
      v_vendor_exec_id,
      v_vendor_area_id
    FROM vendors v
    WHERE v.vendor_code = CONCAT('DEMOV', LPAD(((i - 1) MOD 50) + 1, 3, '0'))
    LIMIT 1;

    SET v_order_no = CONCAT('DEMOORD', LPAD(i, 4, '0'));
    SET v_order_date = DATE_ADD(
      DATE_SUB(CURDATE(), INTERVAL (i MOD 45) DAY),
      INTERVAL (9 + (i MOD 8)) HOUR
    );

    SET v_status = CASE (i MOD 5)
      WHEN 0 THEN 'pending_approval'
      WHEN 1 THEN 'approved'
      WHEN 2 THEN 'assigned'
      WHEN 3 THEN 'delivered'
      ELSE 'rejected'
    END;

    SET v_discount_percent = CASE (i MOD 4)
      WHEN 0 THEN 0
      WHEN 1 THEN 5
      WHEN 2 THEN 10
      ELSE 15
    END;

    SET v_subtotal = 0;
    SET v_item_count = 2 + (i MOD 3);
    SET j = 1;

    WHILE j <= v_item_count DO
      SET v_product_rn = ((i * j + j) MOD v_product_count) + 1;

      SELECT
        product_id,
        product_name,
        brand,
        unit_label,
        selling_price
      INTO
        v_product_id,
        v_product_name,
        v_brand,
        v_unit_label,
        v_unit_price
      FROM tmp_demo_products
      WHERE rn = v_product_rn
      LIMIT 1;

      SET v_quantity = 1 + ((i + j) MOD 4);
      SET v_line_total = ROUND(v_unit_price * v_quantity, 2);
      SET v_subtotal = v_subtotal + v_line_total;

      INSERT INTO tmp_order_lines (
        product_id,
        product_name,
        brand,
        unit_label,
        quantity,
        unit_price,
        line_total
      )
      VALUES (
        v_product_id,
        v_product_name,
        v_brand,
        v_unit_label,
        v_quantity,
        v_unit_price,
        v_line_total
      );

      SET j = j + 1;
    END WHILE;

    SET v_discount_amount = ROUND((v_subtotal * v_discount_percent) / 100, 2);
    SET v_final_amount = ROUND(v_subtotal - v_discount_amount, 2);

    IF v_status = 'rejected' THEN
      SET v_paid_amount = 0;
      SET v_due_amount = 0;
      SET v_payment_status = 'unpaid';
    ELSEIF v_status = 'delivered' THEN
      IF (i MOD 3) = 0 THEN
        SET v_paid_amount = v_final_amount;
      ELSEIF (i MOD 3) = 1 THEN
        SET v_paid_amount = ROUND(v_final_amount * 0.50, 2);
      ELSE
        SET v_paid_amount = 0;
      END IF;

      SET v_due_amount = ROUND(v_final_amount - v_paid_amount, 2);

      SET v_payment_status = CASE
        WHEN v_paid_amount <= 0 THEN 'unpaid'
        WHEN v_paid_amount >= v_final_amount THEN 'paid'
        ELSE 'partial'
      END;
    ELSE
      SET v_paid_amount = 0;
      SET v_due_amount = v_final_amount;
      SET v_payment_status = 'unpaid';
    END IF;

    INSERT INTO orders (
      order_number,
      vendor_id,
      executive_id,
      area_id,
      status,
      subtotal_amount,
      discount_percent,
      discount_amount,
      final_amount,
      paid_amount,
      due_amount,
      payment_status,
      order_note,
      rejection_reason,
      created_by_executive_id,
      approved_by_admin_id,
      approved_at,
      assigned_at,
      delivered_at,
      is_locked,
      created_at,
      updated_at
    )
    VALUES (
      v_order_no,
      v_vendor_id,
      v_vendor_exec_id,
      v_vendor_area_id,
      v_status,
      v_subtotal,
      v_discount_percent,
      v_discount_amount,
      v_final_amount,
      v_paid_amount,
      v_due_amount,
      v_payment_status,
      CONCAT('Demo order note ', i),
      CASE
        WHEN v_status = 'rejected' THEN 'Demo rejection reason for testing'
        ELSE NULL
      END,
      v_vendor_exec_id,
      CASE
        WHEN v_status IN ('approved', 'assigned', 'delivered') THEN v_admin_id
        ELSE NULL
      END,
      CASE
        WHEN v_status IN ('approved', 'assigned', 'delivered') THEN DATE_ADD(v_order_date, INTERVAL 1 HOUR)
        ELSE NULL
      END,
      CASE
        WHEN v_status IN ('assigned', 'delivered') THEN DATE_ADD(v_order_date, INTERVAL 3 HOUR)
        ELSE NULL
      END,
      CASE
        WHEN v_status = 'delivered' THEN DATE_ADD(v_order_date, INTERVAL 1 DAY)
        ELSE NULL
      END,
      1,
      v_order_date,
      v_order_date
    );

    SET v_order_id = LAST_INSERT_ID();

    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      brand,
      unit_label,
      quantity,
      unit_price,
      line_total
    )
    SELECT
      v_order_id,
      product_id,
      product_name,
      brand,
      unit_label,
      quantity,
      unit_price,
      line_total
    FROM tmp_order_lines;

    IF v_status = 'delivered' AND v_paid_amount > 0 THEN
      SET v_payment_mode = CASE
        WHEN (i MOD 2) = 0 THEN 'cash'
        ELSE 'online'
      END;

      SET v_received_by = CASE
        WHEN v_payment_mode = 'cash' THEN 'executive'
        ELSE 'admin'
      END;

      SET v_settlement_status = CASE
        WHEN v_payment_mode = 'cash' THEN 'pending'
        ELSE 'verified'
      END;

      INSERT INTO payments (
        payment_number,
        order_id,
        vendor_id,
        executive_id,
        payment_mode,
        amount_received,
        received_by,
        payment_date,
        settlement_status,
        reference_number,
        note,
        created_at,
        updated_at
      )
      VALUES (
        CONCAT('DEMOPAY', LPAD(i, 4, '0')),
        v_order_id,
        v_vendor_id,
        v_vendor_exec_id,
        v_payment_mode,
        v_paid_amount,
        v_received_by,
        DATE_ADD(v_order_date, INTERVAL 1 DAY),
        v_settlement_status,
        CONCAT('REF', LPAD(i, 6, '0')),
        CONCAT('Demo payment for order ', v_order_no),
        DATE_ADD(v_order_date, INTERVAL 1 DAY),
        DATE_ADD(v_order_date, INTERVAL 1 DAY)
      );
    END IF;

    SET i = i + 1;
  END WHILE;

  SELECT
    'DEMO SEED COMPLETED' AS message,
    (SELECT COUNT(*) FROM areas WHERE area_code LIKE 'DEMOAREA%') AS demo_areas,
    (SELECT COUNT(*) FROM executives WHERE executive_code LIKE 'DEMOEXEC%') AS demo_executives,
    (SELECT COUNT(*) FROM vendors WHERE vendor_code LIKE 'DEMOV%') AS demo_vendors,
    (SELECT COUNT(*) FROM orders WHERE order_number LIKE 'DEMOORD%') AS demo_orders,
    (
      SELECT COUNT(*)
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.order_number LIKE 'DEMOORD%'
    ) AS demo_order_items,
    (SELECT COUNT(*) FROM payments WHERE payment_number LIKE 'DEMOPAY%') AS demo_payments;
END$$

DELIMITER ;

CALL seed_sales_demo_200();

DROP PROCEDURE IF EXISTS seed_sales_demo_200;