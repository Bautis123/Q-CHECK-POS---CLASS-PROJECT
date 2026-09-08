# Q-CHECK POS System Documentation

## 1. Project Overview

Q-CHECK POS is a web-based point-of-sale system for an electronics and gadget retailer. It supports product management, sales checkout, stock management, receipt-based returns, reporting, user management, and role-based screen access.

The project is designed as a school software-engineering project. Its structure demonstrates separation of concerns through a JavaScript frontend, a PHP API, a service and repository backend, and a MySQL database.

## 2. Objectives

The system provides a practical retail workflow that enables authorized staff to:

- sign in with a username and password;
- view a dashboard of sales and stock information;
- create, activate, deactivate, price, and search products;
- receive stock and adjust reorder levels;
- add products to a cart and complete a sale;
- calculate VAT at 16 percent and generate a receipt number;
- process a return using an existing receipt number;
- view sales summaries and export report data as CSV;
- manage users and roles according to access level.

The project deliberately does not include customer records. Returns are linked to receipts rather than customer profiles. Product images and image uploads are also outside the current scope.

## 3. Technology Stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Client | HTML5, CSS3, JavaScript modules | User interface and browser-side state |
| Server | PHP 8 with PDO | API routing, validation, business rules, and database access |
| Database | MySQL or MariaDB | Persistent storage for operational data |
| Local environment | XAMPP | Apache, PHP, MySQL, and phpMyAdmin during development |
| Data format | JSON | Request and response payloads between frontend and API |

## 4. System Architecture

The application uses a layered client-server architecture.

```text
Browser UI
  -> JavaScript modules
  -> api/index.php
  -> Controller
  -> Service
  -> Repository
  -> PDO / MySQL database
```

### 4.1 Frontend Layer

The frontend renders the interface, handles browser events, maintains temporary state, and calls the API.

| File or area | Responsibility |
| --- | --- |
| `index.html` | Login screen and frontend entry page |
| `pages/*.php` | Individual protected application pages |
| `includes/page_start.php` | Shared sidebar, top bar, and page shell |
| `assets/js/main.js` | Page rendering, events, form handling, cart behavior, and role-aware navigation |
| `assets/js/apiClient.js` | `fetch` wrapper for JSON API requests |
| `assets/js/store.js` | In-memory UI state and fallback demo data |
| `assets/js/components.js` | Reusable formatting and UI markup helpers |
| `styles.css` | Shared responsive styling and layout behavior |

The frontend checks the signed-in user's access level before displaying navigation links. When the API or database is unavailable, it can fall back to local demo data so the interface remains demonstrable.

### 4.2 Backend Layer

The PHP backend uses a simple layered design.

| Layer | Location | Responsibility |
| --- | --- | --- |
| Front controller | `api/index.php` | Loads dependencies, connects to the database, selects a route, and handles errors |
| Core helpers | `backend/core` | Reads request input and returns consistent JSON responses |
| Controllers | `backend/controllers` | Converts HTTP actions into service calls |
| Services | `backend/services` | Holds validation and business rules |
| Repositories | `backend/repositories` | Runs SQL through PDO and isolates persistence logic |
| Configuration | `backend/config/Database.php` | Defines the MySQL connection settings |

This separation makes the code easier to test and modify. For example, checkout calculations belong in `SaleService`, while SQL inserts and stock updates belong in `TransactionRepository`.

### 4.3 Request Flow Example: Checkout

1. A cashier adds products to the cart in the POS screen.
2. `main.js` sends the cart and current user to `sales/checkout`.
3. `SaleController` passes the request to `SaleService`.
4. `SaleService` verifies products, active status, quantities, available stock, and totals.
5. `TransactionRepository` creates the transaction, creates its line items, and reduces stock inside one database transaction.
6. The API returns a JSON sale record that the frontend uses to show the receipt.

## 5. Functional Modules

| Module | Main capabilities | Intended roles |
| --- | --- | --- |
| Dashboard | Sales, transaction, active-product, and low-stock metrics | Admin, Manager, Cashier |
| Point of Sale | Product selection, cart quantities, VAT, checkout, printable receipt | Admin, Manager, Cashier |
| Products | Search, create, edit price, activate/deactivate products | Admin, Manager |
| Inventory | View stock, adjust quantities, set reorder levels | Admin, Manager |
| Receive Stock | Record incoming stock | Admin, Manager |
| Returns | Find a receipt, restore stock, and mark a sale as returned | Admin, Manager, Cashier |
| Reports | Sales totals, averages, return value, and CSV export | Admin, Manager |
| Users and Transactions | Create users, create roles, and review transaction history | Admin |

## 6. Database Design

The database name is `gadget_pos`. Its creation script is `database/schema.sql`, and additional demonstration data is in `database/seed_data.sql`.

| Table | Purpose | Key relationships |
| --- | --- | --- |
| `roles` | Defines role names and access levels | Referenced logically by `users.role` |
| `users` | Stores staff identities, password hashes, roles, and status | Username is unique |
| `products` | Stores SKU, name, category, price, stock, reorder level, and active state | Referenced by `transaction_items` |
| `transactions` | Stores receipt headers, cashier, totals, VAT, and sale status | One transaction has many line items |
| `transaction_items` | Stores the products and quantities sold on each receipt | Foreign keys to `transactions` and `products` |
| `returns` | Stores return details linked by receipt number | One return is permitted per receipt by service validation |

### 6.1 Important Integrity Rules

- Product SKUs and usernames are unique.
- A transaction item must belong to a valid transaction and product.
- Checkout rejects an empty cart, unavailable products, invalid quantities, and quantities greater than available stock.
- Checkout creates a sale and deducts stock in one database transaction.
- A return cannot be processed for an unknown receipt or a receipt already returned.
- Processing a return restores the quantities from the original transaction and changes the sale status to `Returned`.

## 7. Backend Business Rules

### Authentication and Users

- Passwords are verified with PHP `password_verify`.
- New users are stored with `password_hash`.
- Inactive users cannot sign in.
- Duplicate usernames and non-existent roles are rejected.

### Products and Inventory

- Product names, categories, prices, stock, and reorder levels are required when a product is created.
- A product price must be greater than zero.
- Stock and reorder levels cannot be negative.
- Only active products can be sold.

### Sales and Returns

- VAT is calculated as 16 percent of the subtotal.
- Receipt numbers follow the format `RCP-YYYYMMDD-sequence`.
- Return numbers follow the format `RET-sequence`.
- Returns use the receipt number as the business identifier.

## 8. API Reference

All API calls pass through `api/index.php` and use query parameters in this pattern:

```text
api/index.php?resource={resource}&action={action}
```

Successful responses use this structure:

```json
{
  "success": true,
  "data": {}
}
```

Errors use this structure:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

| Method | Resource and action | Purpose |
| --- | --- | --- |
| POST | `auth/login` | Authenticate a user |
| GET | `products/index` | List products |
| POST | `products/create` | Create a product |
| POST | `products/receive` | Add received stock |
| POST | `products/updateInventory` | Adjust stock and reorder level |
| POST | `products/updatePrice` | Change product price |
| POST | `products/toggle` | Activate or deactivate a product |
| GET | `sales/index` | List transactions |
| POST | `sales/checkout` | Create a sale and deduct stock |
| POST | `sales/search` | Search transactions by receipt number |
| GET | `returns/index` | List processed returns |
| POST | `returns/process` | Process a receipt-based return |
| GET | `users/index` | List users |
| POST | `users/create` | Create a user |
| GET | `roles/index` | List roles |
| POST | `roles/create` | Create a role |

## 9. Installation and Setup

### 9.1 Prerequisites

- XAMPP with Apache, PHP, MySQL, and phpMyAdmin installed.
- The project folder placed inside `C:\xampp\htdocs`.
- A modern browser.

### 9.2 Configure MySQL

1. Start Apache and MySQL from the XAMPP Control Panel.
2. Open phpMyAdmin.
3. Import `database/schema.sql`. This creates the `gadget_pos` database, tables, roles, users, and basic products.
4. Optionally import `database/seed_data.sql` for additional products and demonstration transactions.
5. Open `backend/config/Database.php` and set the host, port, database name, username, and password to match the local MySQL server.

The current development setup uses XAMPP MySQL on port `3307`. If your XAMPP installation uses the default port `3306`, update the `PORT` constant accordingly. Do not run two MySQL services on the same port.

### 9.3 Run the Application

1. Start Apache in XAMPP.
2. Open `http://localhost/electronic%20and%20gadget%20POS/` in a browser.
3. Sign in with an account created by the schema or add a new user through an administrator account.

The default demonstration usernames are `admin`, `manager`, and `cashier`. Their passwords are defined by the seeded password hashes; see `SETUP.md` for the demonstration credentials used by this project.

## 10. User Interface and Usability Notes

- Protected pages share one consistent sidebar and page header.
- The sidebar shows only pages associated with the signed-in user's access level.
- Wide tables wrap their content to avoid page-level horizontal scrolling.
- On wide POS screens, the cart remains visible and a long cart item list scrolls inside the receipt area so totals and checkout remain accessible.
- Product images are intentionally not used to keep product workflows lightweight.
- Reports can be exported as CSV from the browser.

## 11. Security Considerations and Limitations

The project includes useful basic protections but is a classroom prototype, not a production-ready deployment.

Implemented controls:

- Prepared PDO statements are used for parameterized database queries.
- Passwords are hashed when users are created.
- Login rejects inactive accounts and invalid credentials.
- Server-side validation protects product, stock, checkout, return, user, and role operations.
- Database transactions keep sales and stock deductions consistent.

Current limitations:

- The frontend stores the signed-in user in browser session storage.
- Role restrictions currently control visible navigation in the frontend; the API does not yet enforce server-side authorization for every endpoint.
- The API does not issue session tokens or CSRF protection.
- Demo credentials must be changed before deployment.
- Database credentials should not be committed to a public repository.
- Error messages are suitable for development and should be reduced in a public production environment.

Recommended future improvements are server-side authentication middleware, secure sessions or token-based authentication, per-route authorization, audit logging, automated tests, backups, and deployment configuration through environment variables.

## 12. Testing and Quality Assurance

Testing evidence is stored in `docs/testing`.

| Artifact | Purpose |
| --- | --- |
| `docs/testing/Gadget_POS_Test_Report.md` | Detailed functional, integration, security, database, and performance test report |
| `docs/testing/test_execution_log.md` | Chronological execution log and retest record |
| `docs/testing/Gadget_POS_Test_Report.docx` | Word version of the test report |

The documented tests cover login behavior, input validation, checkout stock rules, receipt item counts, return stock restoration, duplicate-user prevention, database constraints, and basic local performance measurements.

## 13. Maintenance Guide

### Adding a Feature

For a new business feature, keep the existing layering:

1. Add or update the database schema.
2. Add repository methods for data access.
3. Put validation and business rules in a service.
4. Add a controller action and API route.
5. Call the route through `ApiClient`.
6. Add UI rendering and event handling in `main.js`.
7. Add tests and update this document.

### Database Changes

Apply new schema changes deliberately. The supplied schema uses `CREATE TABLE IF NOT EXISTS`, which creates missing tables but does not modify an existing table definition. Use an explicit migration or a carefully controlled database update when changing a live schema.

### Backup Guidance

Before importing a revised schema or making structural changes, export the existing database from phpMyAdmin. This protects transaction and inventory data from accidental loss during development.

## 14. Project Structure

```text
electronic and gadget POS/
├── api/                  API front controller
├── assets/js/            Frontend modules
├── backend/
│   ├── config/           Database configuration
│   ├── controllers/      HTTP-facing controllers
│   ├── core/             Request and response utilities
│   ├── repositories/     SQL persistence layer
│   └── services/         Business logic layer
├── database/             Schema and seed scripts
├── docs/                 Documentation and test evidence
├── includes/             Shared page layout
├── pages/                Protected PHP page shells
├── app.js                JavaScript module entry point
├── index.html            Login page
├── styles.css            Shared stylesheet
├── SETUP.md              Concise setup instructions
└── ARCHITECTURE.md       Engineering notes
```

## 15. Conclusion

Q-CHECK POS demonstrates a complete small-scale retail workflow and a maintainable web application structure. Its layered PHP backend, modular JavaScript frontend, relational database design, validation rules, and documented test evidence provide a solid basis for an Advanced Software Engineering school project. The listed security and deployment improvements identify clear next steps for evolving the prototype into a production-oriented system.
