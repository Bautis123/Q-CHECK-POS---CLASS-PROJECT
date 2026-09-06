USE gadget_pos;

START TRANSACTION;

-- ============================================================
-- 1. ADD MORE REALISTIC ELECTRONIC / GADGET PRODUCTS
-- ============================================================

INSERT INTO products
(
    sku,
    name,
    category,
    image_path,
    price,
    stock,
    reorder_level,
    active
)
VALUES

('P1007', 'HP ProBook 450 G10', 'Laptops', NULL,
22500.00, 0, 2, 1),

('P1008', 'Dell Inspiron 15 3530', 'Laptops', NULL,
16800.00, 5, 3, 1),

('P1009', 'Apple iPhone 15 128GB', 'Phones', NULL,
24500.00, 2, 2, 1),

('P1010', 'Xiaomi Redmi Note 13', 'Phones', NULL,
6200.00, 8, 4, 1),

('P1011', 'Samsung Galaxy Tab A9+', 'Tablets', NULL,
9500.00, 3, 3, 1),

('P1012', 'Sony WH-CH520 Wireless Headphones', 'Audio', NULL,
1350.00, 9, 5, 1),

('P1013', 'Anker PowerCore 20000mAh Power Bank', 'Accessories', NULL,
1100.00, 4, 6, 1),

('P1014', 'SanDisk Ultra 128GB USB 3.0 Flash Drive', 'Storage', NULL,
280.00, 18, 10, 1),

('P1015', 'Logitech K380 Bluetooth Keyboard', 'Accessories', NULL,
850.00, 6, 4, 1),

('P1016', 'HDMI Cable 2 Metre', 'Accessories', NULL,
120.00, 35, 15, 1),

('P1017', 'Tecno Spark 20', 'Phones', NULL,
4800.00, 12, 5, 1),

('P1018', 'TP-Link Archer C6 Wi-Fi Router', 'Networking', NULL,
850.00, 2, 3, 1)

ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    category = VALUES(category),
    price = VALUES(price),
    stock = VALUES(stock),
    reorder_level = VALUES(reorder_level),
    active = VALUES(active);


-- ============================================================
-- 2. UPDATE EXISTING PRODUCT STOCK
-- Gives you Good, Low Stock and Out-of-Stock situations
-- ============================================================

UPDATE products SET stock = 7,  reorder_level = 4  WHERE sku = 'P1001';
UPDATE products SET stock = 11, reorder_level = 6  WHERE sku = 'P1002';
UPDATE products SET stock = 4,  reorder_level = 3  WHERE sku = 'P1003';
UPDATE products SET stock = 19, reorder_level = 8  WHERE sku = 'P1004';
UPDATE products SET stock = 26, reorder_level = 10 WHERE sku = 'P1005';
UPDATE products SET stock = 3,  reorder_level = 10 WHERE sku = 'P1006';

UPDATE products SET stock = 0,  reorder_level = 2  WHERE sku = 'P1007';
UPDATE products SET stock = 5,  reorder_level = 3  WHERE sku = 'P1008';
UPDATE products SET stock = 2,  reorder_level = 2  WHERE sku = 'P1009';
UPDATE products SET stock = 8,  reorder_level = 4  WHERE sku = 'P1010';
UPDATE products SET stock = 3,  reorder_level = 3  WHERE sku = 'P1011';
UPDATE products SET stock = 9,  reorder_level = 5  WHERE sku = 'P1012';
UPDATE products SET stock = 4,  reorder_level = 6  WHERE sku = 'P1013';
UPDATE products SET stock = 18, reorder_level = 10 WHERE sku = 'P1014';
UPDATE products SET stock = 6,  reorder_level = 4  WHERE sku = 'P1015';
UPDATE products SET stock = 35, reorder_level = 15 WHERE sku = 'P1016';
UPDATE products SET stock = 12, reorder_level = 5  WHERE sku = 'P1017';
UPDATE products SET stock = 2,  reorder_level = 3  WHERE sku = 'P1018';


-- ============================================================
-- 3. REMOVE PREVIOUS DEMO TRANSACTION ITEMS IF SCRIPT IS RE-RUN
-- ============================================================

DELETE ti
FROM transaction_items ti
INNER JOIN transactions t
    ON ti.transaction_id = t.id
WHERE t.receipt_no LIKE 'RCP-DEMO-%';


-- ============================================================
-- 4. REMOVE PREVIOUS DEMO RETURNS
-- ============================================================

DELETE FROM returns
WHERE return_no LIKE 'RTN-DEMO-%';


-- ============================================================
-- 5. REMOVE PREVIOUS DEMO TRANSACTIONS
-- ============================================================

DELETE FROM transactions
WHERE receipt_no LIKE 'RCP-DEMO-%';


-- ============================================================
-- 6. INSERT SALES TRANSACTIONS
-- VAT testing assumption: 16%
-- ============================================================

INSERT INTO transactions
(
    receipt_no,
    cashier_name,
    subtotal,
    vat,
    total,
    status,
    created_at
)
VALUES

(
    'RCP-DEMO-20260825-1001',
    'Bautis Chileshe',
    10150.00,
    1624.00,
    11774.00,
    'Paid',
    '2026-08-25 09:15:00'
),

(
    'RCP-DEMO-20260826-1002',
    'Bautis Chileshe',
    1080.00,
    172.80,
    1252.80,
    'Paid',
    '2026-08-26 11:42:00'
),

(
    'RCP-DEMO-20260827-1003',
    'Sereni Banda',
    18780.00,
    3004.80,
    21784.80,
    'Paid',
    '2026-08-27 14:10:00'
),

(
    'RCP-DEMO-20260828-1004',
    'Bautis Chileshe',
    7300.00,
    1168.00,
    8468.00,
    'Paid',
    '2026-08-28 10:25:00'
),

(
    'RCP-DEMO-20260829-1005',
    'Bautis Chileshe',
    3000.00,
    480.00,
    3480.00,
    'Paid',
    '2026-08-29 16:18:00'
),

(
    'RCP-DEMO-20260830-1006',
    'Sereni Banda',
    15050.00,
    2408.00,
    17458.00,
    'Paid',
    '2026-08-30 12:35:00'
),

(
    'RCP-DEMO-20260831-1007',
    'Bautis Chileshe',
    5500.00,
    880.00,
    6380.00,
    'Paid',
    '2026-08-31 15:02:00'
),

(
    'RCP-DEMO-20260901-1008',
    'Bautis Chileshe',
    17220.00,
    2755.20,
    19975.20,
    'Paid',
    '2026-09-01 09:48:00'
),

(
    'RCP-DEMO-20260902-1009',
    'Sereni Banda',
    970.00,
    155.20,
    1125.20,
    'Paid',
    '2026-09-02 13:23:00'
),

(
    'RCP-DEMO-20260903-1010',
    'Bautis Chileshe',
    25600.00,
    4096.00,
    29696.00,
    'Paid',
    '2026-09-03 11:05:00'
),

(
    'RCP-DEMO-20260904-1011',
    'Bautis Chileshe',
    10060.00,
    1609.60,
    11669.60,
    'Paid',
    '2026-09-04 15:44:00'
),

(
    'RCP-DEMO-20260905-1012',
    'Bautis Chileshe',
    1350.00,
    216.00,
    1566.00,
    'Returned',
    '2026-09-05 10:20:00'
);


-- ============================================================
-- 7. INSERT ITEMS FOR EACH TRANSACTION
-- Uses receipt number and SKU instead of assuming specific IDs
-- ============================================================


-- ----------------------------
-- RECEIPT 1001
-- Samsung Galaxy A55 + Charger
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260825-1001'),
    (SELECT id FROM products WHERE sku = 'P1002'),
    'Samsung Galaxy A55',
    1,
    9800.00,
    9800.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260825-1001'),
    (SELECT id FROM products WHERE sku = 'P1006'),
    'USB-C Fast Charger',
    1,
    350.00,
    350.00
);


-- ----------------------------
-- RECEIPT 1002
-- Two mice + two HDMI cables
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260826-1002'),
    (SELECT id FROM products WHERE sku = 'P1005'),
    'Logitech Wireless Mouse',
    2,
    420.00,
    840.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260826-1002'),
    (SELECT id FROM products WHERE sku = 'P1016'),
    'HDMI Cable 2 Metre',
    2,
    120.00,
    240.00
);


-- ----------------------------
-- RECEIPT 1003
-- Lenovo laptop + flash drive
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260827-1003'),
    (SELECT id FROM products WHERE sku = 'P1001'),
    'Lenovo ThinkPad E14',
    1,
    18500.00,
    18500.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260827-1003'),
    (SELECT id FROM products WHERE sku = 'P1014'),
    'SanDisk Ultra 128GB USB 3.0 Flash Drive',
    1,
    280.00,
    280.00
);


-- ----------------------------
-- RECEIPT 1004
-- Redmi phone + power bank
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260828-1004'),
    (SELECT id FROM products WHERE sku = 'P1010'),
    'Xiaomi Redmi Note 13',
    1,
    6200.00,
    6200.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260828-1004'),
    (SELECT id FROM products WHERE sku = 'P1013'),
    'Anker PowerCore 20000mAh Power Bank',
    1,
    1100.00,
    1100.00
);


-- ----------------------------
-- RECEIPT 1005
-- JBL + Sony headphones
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260829-1005'),
    (SELECT id FROM products WHERE sku = 'P1004'),
    'JBL Tune Headphones',
    1,
    1650.00,
    1650.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260829-1005'),
    (SELECT id FROM products WHERE sku = 'P1012'),
    'Sony WH-CH520 Wireless Headphones',
    1,
    1350.00,
    1350.00
);


-- ----------------------------
-- RECEIPT 1006
-- iPad + keyboard
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260830-1006'),
    (SELECT id FROM products WHERE sku = 'P1003'),
    'Apple iPad 10th Gen',
    1,
    14200.00,
    14200.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260830-1006'),
    (SELECT id FROM products WHERE sku = 'P1015'),
    'Logitech K380 Bluetooth Keyboard',
    1,
    850.00,
    850.00
);


-- ----------------------------
-- RECEIPT 1007
-- Tecno phone + two chargers
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260831-1007'),
    (SELECT id FROM products WHERE sku = 'P1017'),
    'Tecno Spark 20',
    1,
    4800.00,
    4800.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260831-1007'),
    (SELECT id FROM products WHERE sku = 'P1006'),
    'USB-C Fast Charger',
    2,
    350.00,
    700.00
);


-- ----------------------------
-- RECEIPT 1008
-- Dell laptop + mouse
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260901-1008'),
    (SELECT id FROM products WHERE sku = 'P1008'),
    'Dell Inspiron 15 3530',
    1,
    16800.00,
    16800.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260901-1008'),
    (SELECT id FROM products WHERE sku = 'P1005'),
    'Logitech Wireless Mouse',
    1,
    420.00,
    420.00
);


-- ----------------------------
-- RECEIPT 1009
-- Router + HDMI cable
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260902-1009'),
    (SELECT id FROM products WHERE sku = 'P1018'),
    'TP-Link Archer C6 Wi-Fi Router',
    1,
    850.00,
    850.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260902-1009'),
    (SELECT id FROM products WHERE sku = 'P1016'),
    'HDMI Cable 2 Metre',
    1,
    120.00,
    120.00
);


-- ----------------------------
-- RECEIPT 1010
-- iPhone + power bank
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260903-1010'),
    (SELECT id FROM products WHERE sku = 'P1009'),
    'Apple iPhone 15 128GB',
    1,
    24500.00,
    24500.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260903-1010'),
    (SELECT id FROM products WHERE sku = 'P1013'),
    'Anker PowerCore 20000mAh Power Bank',
    1,
    1100.00,
    1100.00
);


-- ----------------------------
-- RECEIPT 1011
-- Samsung tablet + two flash drives
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260904-1011'),
    (SELECT id FROM products WHERE sku = 'P1011'),
    'Samsung Galaxy Tab A9+',
    1,
    9500.00,
    9500.00
),

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260904-1011'),
    (SELECT id FROM products WHERE sku = 'P1014'),
    'SanDisk Ultra 128GB USB 3.0 Flash Drive',
    2,
    280.00,
    560.00
);


-- ----------------------------
-- RECEIPT 1012
-- Sony headphones
-- This transaction is returned
-- ----------------------------

INSERT INTO transaction_items
(
    transaction_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    line_total
)
VALUES

(
    (SELECT id FROM transactions
        WHERE receipt_no = 'RCP-DEMO-20260905-1012'),
    (SELECT id FROM products WHERE sku = 'P1012'),
    'Sony WH-CH520 Wireless Headphones',
    1,
    1350.00,
    1350.00
);


-- ============================================================
-- 8. INSERT RETURN RECORD
-- ============================================================

INSERT INTO returns
(
    return_no,
    receipt_no,
    processed_by,
    amount,
    reason,
    created_at
)
VALUES

(
    'RTN-DEMO-20260905-2001',
    'RCP-DEMO-20260905-1012',
    'Sereni Banda',
    1566.00,
    'Customer reported intermittent audio connection shortly after purchase.',
    '2026-09-05 15:40:00'
);


COMMIT;