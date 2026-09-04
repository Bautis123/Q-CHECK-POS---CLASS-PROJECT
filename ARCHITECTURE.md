# Gadget POS Engineering Notes

This prototype keeps the interface simple, but the JavaScript is organized around common Advanced Software Engineering principles.

## Main Design Choices

- Separation of concerns: rendering functions build screens, services contain business rules, and repositories isolate data access.
- Single responsibility: `AuthService`, `InventoryService`, `CartService`, `SalesService`, `ReturnService`, and `UserService` each manage one business area.
- Low coupling: services depend on repositories instead of directly depending on table markup or DOM elements.
- High cohesion: related operations such as stock receiving and stock adjustment stay in the inventory service.
- Open for extension: another repository implementation, such as local storage or a database API, can replace `InMemoryRepository` without rewriting the UI.
- Role-based access control: navigation is generated from user roles, so admin, manager, and cashier users see different permitted screens.
- Business-rule traceability: checkout generates receipt numbers, and returns are processed by receipt number instead of customer records.

## PHP Backend Modules

- `api/index.php`: front controller and router.
- `backend/config`: database configuration.
- `backend/core`: shared request and response helpers.
- `backend/repositories`: database access classes.
- `backend/services`: business rules for authentication, inventory, sales, returns, and users.
- `backend/controllers`: HTTP-facing classes that translate requests into service calls.

## Frontend Components

- `assets/js/apiClient.js`: API communication.
- `assets/js/store.js`: application state and demo fallback data.
- `assets/js/components.js`: reusable UI helpers for tables, cards, statuses, metrics, and formatting.
- `assets/js/main.js`: app controller, screen rendering, and event handling.

## Page Modules

- `index.html`: login page.
- `includes/page_start.php` and `includes/page_end.php`: shared protected-page layout.
- `pages/*.php`: one PHP file per application screen.

## Demo Users

| Name | Username | Password | Role |
| --- | --- | --- | --- |
| Jonathan Mwale | admin | Admin | Admin |
| Sereni Banda | manager | Manager | Manager |
| Bautis Chileshe | cashier | Cashier | Cashier |

## Removed Scope

Customer management was removed because the system no longer tracks customers. Returns now use the receipt number generated after each sale.
