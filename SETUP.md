# Q-CHECK POS Setup

## 1. Create the Database

Open MySQL or phpMyAdmin and import:

```sql
database/schema.sql
```

The schema creates a database named `gadget_pos` and seeds the default users, roles, and products. Re-import it after pulling updates so the `roles` table and product image paths are created.

## 2. Database Connection

The PHP connection is configured in:

```text
backend/config/Database.php
```

Default XAMPP settings are used:

```text
host: 127.0.0.1
database: gadget_pos
username: root
password: empty
```

## 3. Demo Users

| Name | Username | Password | Role |
| --- | --- | --- | --- |
| Jonathan Mwale | admin | Admin | Admin |
| Sereni Banda | manager | Manager | Manager |
| Bautis Chileshe | cashier | Cashier | Cashier |

## 4. API Endpoints

All API requests pass through:

```text
api/index.php
```

Examples:

```text
POST api/index.php?resource=auth&action=login
GET  api/index.php?resource=products
POST api/index.php?resource=products&action=create
POST api/index.php?resource=products&action=receive
POST api/index.php?resource=products&action=updateInventory
POST api/index.php?resource=sales&action=checkout
POST api/index.php?resource=returns&action=process
GET  api/index.php?resource=users
GET  api/index.php?resource=roles
POST api/index.php?resource=roles&action=create
```

## 5. Frontend Modules

The frontend entry file is:

```text
app.js
```

It imports:

```text
assets/js/apiClient.js
assets/js/store.js
assets/js/components.js
assets/js/main.js
```

If the PHP API or MySQL database is offline, the frontend falls back to demo data so the interface can still be viewed.

## 6. Separate Pages

Login starts at:

```text
index.html
```

The application screens are separate PHP files:

```text
pages/dashboard.php
pages/point-of-sale.php
pages/products.php
pages/inventory.php
pages/receive-stock.php
pages/returns.php
pages/reports.php
pages/users-transactions.php
```
