CREATE DATABASE IF NOT EXISTS gadget_pos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gadget_pos;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Manager', 'Cashier') NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  image_path VARCHAR(255) NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(40) NOT NULL UNIQUE,
  cashier_name VARCHAR(120) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  vat DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  status ENUM('Paid', 'Returned') NOT NULL DEFAULT 'Paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  return_no VARCHAR(40) NOT NULL UNIQUE,
  receipt_no VARCHAR(40) NOT NULL,
  processed_by VARCHAR(120) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (full_name, username, password_hash, role, status)
VALUES
  ('Jonathan Mwale', 'admin', '$2y$10$Qlh9peMEkdfuvnb8iYgzXeI932u4gEZPFH0p/Is89VyXqv2Eub3.a', 'Admin', 'Active'),
  ('Sereni Banda', 'manager', '$2y$10$FLpXuzYQIgX.rHxB/WFNnutMxR.tsassqil6Sjy1Ie3DWIQyu/6ii', 'Manager', 'Active'),
  ('Bautis Chileshe', 'cashier', '$2y$10$kGh0bY5cnlLL1BIhL6LMOOQDVjM4.oChfR6ISRzr33wvYNaijbeIa', 'Cashier', 'Active')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  status = VALUES(status);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL AFTER category;

INSERT INTO products (sku, name, category, image_path, price, stock, reorder_level, active)
VALUES
  ('P1001', 'Lenovo ThinkPad E14', 'Laptops', NULL, 18500.00, 8, 4, 1),
  ('P1002', 'Samsung Galaxy A55', 'Phones', 'uploads/products/samsung-galaxy-a55.png', 9800.00, 14, 6, 1),
  ('P1003', 'Apple iPad 10th Gen', 'Tablets', 'uploads/products/ipad-10th-gen.png', 14200.00, 5, 3, 1),
  ('P1004', 'JBL Tune Headphones', 'Audio', 'uploads/products/jbl-tune-headphones.png', 1650.00, 22, 8, 1),
  ('P1005', 'Logitech Wireless Mouse', 'Accessories', 'uploads/products/logitech-wireless-mouse.png', 420.00, 32, 10, 1),
  ('P1006', 'USB-C Fast Charger', 'Accessories', NULL, 350.00, 3, 10, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  image_path = VALUES(image_path);

UPDATE products SET image_path = 'uploads/products/samsung-galaxy-a55.png' WHERE sku = 'P1002';
UPDATE products SET image_path = 'uploads/products/ipad-10th-gen.png' WHERE sku = 'P1003';
UPDATE products SET image_path = 'uploads/products/jbl-tune-headphones.png' WHERE sku = 'P1004';
UPDATE products SET image_path = 'uploads/products/logitech-wireless-mouse.png' WHERE sku = 'P1005';
