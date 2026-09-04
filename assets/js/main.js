import { ApiClient } from "./apiClient.js";
import { seedData, store } from "./store.js";
import { currency, empty, escapeHtml, initials, metric, status, stockStatus, tableCard, toolbar } from "./components.js";

const api = new ApiClient(window.APP_API_BASE || "api/index.php");
const today = new Date().toISOString().slice(0, 10);

const navItems = [
  ["dashboard", "DB", "Dashboard", ["Admin", "Manager", "Cashier"], "dashboard.php"],
  ["pos", "POS", "Point of Sale", ["Admin", "Manager", "Cashier"], "point-of-sale.php"],
  ["products", "PR", "Products", ["Admin", "Manager"], "products.php"],
  ["inventory", "IN", "Inventory", ["Admin", "Manager"], "inventory.php"],
  ["receive", "RS", "Receive Stock", ["Admin", "Manager"], "receive-stock.php"],
  ["returns", "RT", "Returns", ["Admin", "Manager", "Cashier"], "returns.php"],
  ["reports", "RP", "Reports", ["Admin", "Manager"], "reports.php"],
  ["users", "UT", "Users & Transactions", ["Admin"], "users-transactions.php"]
];

const elements = {
  loginScreen: document.getElementById("login-screen"),
  appShell: document.getElementById("app-shell"),
  loginForm: document.getElementById("login-form"),
  loginError: document.getElementById("login-error"),
  logoutButton: document.getElementById("logout-btn"),
  nav: document.getElementById("main-nav"),
  root: document.getElementById("view-root"),
  title: document.getElementById("section-title"),
  kicker: document.getElementById("section-kicker"),
  dateLabel: document.getElementById("date-label"),
  userPill: document.querySelector(".user-pill")
};

bootstrap();

function bootstrap() {
  if (elements.dateLabel) {
    elements.dateLabel.textContent = new Date().toLocaleDateString("en-ZM", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  if (elements.loginForm) {
    bootLoginPage();
    return;
  }

  bootProtectedPage();
}

function bootLoginPage() {
  if (readSessionUser()) {
    window.location.href = "pages/dashboard.php";
    return;
  }

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const user = await login(username, password);

    if (!user) {
      elements.loginError.hidden = false;
      return;
    }

    sessionStorage.setItem("gadgetPosUser", JSON.stringify(user));
    window.location.href = "pages/dashboard.php";
  });
}

async function bootProtectedPage() {
  const user = readSessionUser();
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  store.currentUser = user;
  store.currentView = document.body.dataset.view || "dashboard";
  bindProtectedEvents();
  await refreshData();
  render();
}

function bindProtectedEvents() {
  elements.logoutButton?.addEventListener("click", () => {
    sessionStorage.removeItem("gadgetPosUser");
    store.currentUser = null;
    store.cart = [];
    store.lastReceipt = null;
    window.location.href = "../index.html";
  });

  elements.root?.addEventListener("input", (event) => {
    const targetId = event.target.id;
    const position = event.target.selectionStart;
    if (targetId !== "search" && targetId !== "receipt-lookup") return;

    if (targetId === "search") store.search = event.target.value;
    if (targetId === "receipt-lookup") store.receiptLookup = event.target.value;
    render();
    restoreInputFocus(targetId, position);
  });

  elements.root?.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const id = Number(action.dataset.id);
    const receiptNo = action.dataset.receipt;

    try {
      if (action.dataset.action === "addToCart") addToCart(id);
      if (action.dataset.action === "increaseCart") changeCartQuantity(id, 1);
      if (action.dataset.action === "decreaseCart") changeCartQuantity(id, -1);
      if (action.dataset.action === "clearCart") store.cart = [];
      if (action.dataset.action === "checkout") await checkout();
      if (action.dataset.action === "toggleProduct") await toggleProduct(id);
      if (action.dataset.action === "adjustStock") await receiveStock(id, 1);
      if (action.dataset.action === "processReturn") await processReturn(receiptNo);
      if (action.dataset.action === "updatePrice") await updatePrice(id);
      if (action.dataset.action === "printReceipt") {
        window.print();
        return;
      }
      if (action.dataset.action === "newRecord") focusNewRecordForm();
      if (action.dataset.action === "exportData") exportCurrentView(action.dataset.export);
      render();
    } catch (error) {
      window.alert(error.message);
    }
  });

  elements.root?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      if (form.id === "product-form") await createProduct(formData);
      if (form.id === "receive-form") await receiveStock(Number(data.product_id), Number(data.quantity));
      if (form.id === "inventory-form") await saveInventory(data);
      if (form.id === "user-form") await createUser(data);
      if (form.id === "role-form") await createRole(data);

      form.reset();
      render();
    } catch (error) {
      window.alert(error.message);
    }
  });
}

function readSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("gadgetPosUser"));
  } catch {
    return null;
  }
}

async function login(username, password) {
  try {
    const data = await api.post("auth", "login", { username, password });
    store.apiOnline = true;
    return data.user;
  } catch {
    store.apiOnline = false;
    const user = seedData.users.find((item) =>
      item.username.toLowerCase() === username.toLowerCase() &&
      item.password === password &&
      item.status === "Active"
    );
    return user ? { ...user, accessLevel: roleAccessLevel(user.role) } : null;
  }
}

async function refreshData() {
  if (!store.apiOnline) return;
  try {
    const [products, transactions, returns, users, roles] = await Promise.all([
      api.get("products"),
      api.get("sales"),
      api.get("returns"),
      api.get("users"),
      api.get("roles")
    ]);
    store.data.products = products.products;
    store.data.transactions = transactions.transactions;
    store.data.returns = returns.returns;
    store.data.users = users.users;
    store.data.roles = roles.roles;
  } catch {
    store.apiOnline = false;
  }
}

function render() {
  renderNavigation();
  const current = availableNavItems().find(([id]) => id === store.currentView) || availableNavItems()[0];
  store.currentView = current[0];
  elements.title.textContent = current[2];
  elements.kicker.textContent = current[2];
  elements.userPill.textContent = `${store.currentUser.name} (${store.currentUser.role})`;
  elements.root.innerHTML = viewMap[store.currentView]();
}

function availableNavItems() {
  return navItems.filter((item) => item[3].includes(roleAccessLevel(store.currentUser.role)));
}

function renderNavigation() {
  elements.nav.innerHTML = availableNavItems().map(([id, icon, label, roles, url]) => `
    <a class="nav-item ${id === store.currentView ? "active" : ""}" href="${url}" data-view="${id}">
      <span class="nav-icon">${icon}</span>
      <span>${label}</span>
    </a>
  `).join("");
}

const viewMap = {
  dashboard,
  pos,
  products,
  inventory,
  receive,
  returns,
  reports,
  users
};

function dashboard() {
  const activeProducts = store.data.products.filter((product) => product.active).length;
  const lowStock = store.data.products.filter((product) => product.stock <= product.reorder).length;
  const todaySales = store.data.transactions
    .filter((sale) => sale.date === today)
    .reduce((sum, sale) => sum + sale.total, 0);
  return `
    ${store.apiOnline ? "" : `<section class="notice">Database API is offline. The app is using demo data until MySQL is configured.</section>`}
    <section class="grid four" style="margin-top:16px">
      ${metric("Today Sales", currency.format(todaySales))}
      ${metric("Transactions", store.data.transactions.length)}
      ${metric("Active Products", activeProducts)}
      ${metric("Low Stock Items", lowStock)}
    </section>
    <section class="grid two" style="margin-top:16px">
      ${tableCard("Recent Transactions", transactionRows(store.data.transactions.slice(0, 5)))}
      ${tableCard("Stock Alerts", stockRows(store.data.products.filter((product) => product.stock <= product.reorder)))}
    </section>
  `;
}

function pos() {
  const products = filteredProducts().filter((product) => product.active);
  return `
    <section class="pos-layout">
      <div>
        ${toolbar("Search products", store.search)}
        <div class="product-grid">${products.map(productButton).join("") || empty("No matching products.")}</div>
      </div>
      <aside class="card">
        <div class="card-header">
          <h3 class="card-title">Cart</h3>
          <button class="btn small" type="button" data-action="clearCart">Clear</button>
        </div>
        <div class="card-body">
          ${receiptPanel(store.lastReceipt)}
          <div class="cart-lines" style="margin-top:14px">${cartLines().map(cartLine).join("") || empty("Cart is empty.")}</div>
          ${cartSummary()}
          <button class="btn primary full-width" style="margin-top:14px" type="button" data-action="checkout">Checkout & Generate Receipt</button>
        </div>
      </aside>
    </section>
  `;
}

function products() {
  return `
    <section class="grid two">
      <div>
        ${toolbar("Search products", store.search)}
        ${tableCard("Product List", productRows(filteredProducts()))}
      </div>
      <form id="product-form" class="card" enctype="multipart/form-data">
        <div class="card-header"><h3 class="card-title">Add Product</h3></div>
        <div class="card-body form-stack">
          <label>Name<input name="name" required></label>
          <label>Product Image<input name="image" type="file" accept="image/png,image/jpeg,image/webp"></label>
          <div class="form-grid">
            <label>Category<input name="category" required></label>
            <label>Price<input name="price" type="number" min="1" required></label>
            <label>Stock<input name="stock" type="number" min="0" required></label>
            <label>Reorder Level<input name="reorder_level" type="number" min="0" required></label>
          </div>
          <button class="btn primary" type="submit">Add Product</button>
        </div>
      </form>
    </section>
  `;
}

function inventory() {
  return `
    <section class="grid two">
      <div>
        ${toolbar("Search inventory", store.search)}
        ${tableCard("Stock Levels and Adjustments", inventoryRows(filteredProducts()))}
      </div>
      <form id="inventory-form" class="card">
        <div class="card-header"><h3 class="card-title">Add Inventory</h3></div>
        <div class="card-body form-stack">
          <label>
            Product
            <select name="product_id" required>
              ${store.data.products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)}</option>`).join("")}
            </select>
          </label>
          <div class="form-grid">
            <label>Quantity to Add<input name="quantity" type="number" min="1" required></label>
            <label>Reorder Level<input name="reorder_level" type="number" min="0" required></label>
          </div>
          <button class="btn primary" type="submit">Save Inventory</button>
        </div>
      </form>
    </section>
  `;
}

function receive() {
  return `
    <section class="grid two">
      <form id="receive-form" class="card">
        <div class="card-header"><h3 class="card-title">Receive Stock</h3></div>
        <div class="card-body form-stack">
          <label>
            Product
            <select name="product_id" required>
            ${store.data.products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)}</option>`).join("") || `<option value="" disabled>No products available</option>`}
            </select>
          </label>
          <div class="form-grid">
            <label>Quantity<input name="quantity" type="number" min="1" required></label>
            <label>Supplier<input name="supplier" required></label>
          </div>
          <label>Note<textarea name="note"></textarea></label>
          <button class="btn primary" type="submit">Add Incoming Stock</button>
        </div>
      </form>
      ${tableCard("Current Stock", stockRows(store.data.products))}
    </section>
  `;
}

function returns() {
  const matches = store.receiptLookup
    ? store.data.transactions.filter((sale) => sale.receiptNo.toLowerCase().includes(store.receiptLookup.toLowerCase()))
    : store.data.transactions;
  return `
    <div class="toolbar">
      <input id="receipt-lookup" type="search" value="${escapeHtml(store.receiptLookup)}" placeholder="Enter receipt number">
    </div>
    <section class="grid two">
      ${tableCard("Find Sale by Receipt Number", `
        <table>
          <thead><tr><th>Receipt No.</th><th>Date</th><th>Cashier</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${matches.map((sale) => `
              <tr>
                <td>${sale.receiptNo}</td>
                <td>${sale.date}</td>
                <td>${escapeHtml(sale.cashier)}</td>
                <td>${currency.format(sale.total)}</td>
                <td>${status(sale.status, sale.status === "Returned" ? "out" : "active")}</td>
                <td>
                  ${sale.status === "Returned"
                    ? `<button class="btn small" type="button" disabled>Returned</button>`
                    : `<button class="btn small" type="button" data-action="processReturn" data-receipt="${sale.receiptNo}">Process Return</button>`}
                </td>
              </tr>
            `).join("") || `<tr><td colspan="6">${empty("No receipt found.")}</td></tr>`}
          </tbody>
        </table>
      `)}
      ${tableCard("Processed Returns", returnRows())}
    </section>
  `;
}

function reports() {
  const totalsByDay = store.data.transactions.reduce((acc, sale) => {
    acc[sale.date] = (acc[sale.date] || 0) + sale.total;
    return acc;
  }, {});
  const totalRevenue = store.data.transactions.reduce((sum, sale) => sum + sale.total, 0);
  return `
    <section class="grid three">
      ${metric("Total Revenue", currency.format(totalRevenue))}
      ${metric("Average Sale", currency.format(totalRevenue / Math.max(store.data.transactions.length, 1)))}
      ${metric("Returns Value", currency.format(store.data.returns.reduce((sum, item) => sum + item.amount, 0)))}
    </section>
    <section style="margin-top:16px">
      ${tableCard("Basic Sales Report", `
        <table>
          <thead><tr><th>Date</th><th>Sales Total</th><th>Transactions</th></tr></thead>
          <tbody>
            ${Object.entries(totalsByDay).map(([date, total]) => `
              <tr><td>${date}</td><td>${currency.format(total)}</td><td>${store.data.transactions.filter((sale) => sale.date === date).length}</td></tr>
            `).join("")}
          </tbody>
        </table>
      `)}
    </section>
  `;
}

function users() {
  return `
    <section class="grid two">
      <div class="grid">
        ${tableCard("Users", userRows())}
        ${tableCard("Transaction History", transactionRows(store.data.transactions))}
      </div>
      <div class="grid">
        <form id="user-form" class="card">
          <div class="card-header"><h3 class="card-title">Add User</h3></div>
          <div class="card-body form-stack">
            <label>Name<input name="full_name" required></label>
            <div class="form-grid">
              <label>Username<input name="username" required></label>
              <label>Password<input name="password" type="password" required></label>
            </div>
            <label>
              Role
              <select name="role">${store.data.roles.map((role) => `<option>${escapeHtml(role.name)}</option>`).join("")}</select>
            </label>
            <button class="btn primary" type="submit">Create User</button>
          </div>
        </form>
        <form id="role-form" class="card">
          <div class="card-header"><h3 class="card-title">Create Role</h3></div>
          <div class="card-body form-stack">
            <label>Role Name<input name="name" placeholder="e.g. Stock Clerk" required></label>
            <label>
              Access Level
              <select name="access_level">
                <option value="Cashier">Cashier</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
            <p class="muted">The role will use the selected access level's pages and permissions.</p>
            <button class="btn primary" type="submit">Create Role</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function productButton(product) {
  return `
    <button class="product-button" type="button" data-action="addToCart" data-id="${product.id}">
      ${productPhoto(product)}
      <span>
        <strong>${escapeHtml(product.name)}</strong>
        <span class="muted">${escapeHtml(product.category)}</span><br>
        <span>${currency.format(product.price)}</span><br>
        <span class="muted">${product.stock} in stock</span>
      </span>
    </button>
  `;
}

function productRows(products) {
  return `
    <table>
      <thead><tr><th>Image</th><th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${products.map((product) => `
          <tr>
            <td>${productPhoto(product)}</td>
            <td>${product.sku}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.category)}</td>
            <td>
              <div class="price-edit">
                <input type="number" min="1" step="0.01" value="${product.price}" data-price-input="${product.id}" aria-label="Price for ${escapeHtml(product.name)}">
                <button class="btn small" type="button" data-action="updatePrice" data-id="${product.id}">Save</button>
              </div>
            </td>
            <td>${status(product.active ? "Active" : "Inactive", product.active ? "active" : "out")}</td>
            <td><button class="btn small" type="button" data-action="toggleProduct" data-id="${product.id}">${product.active ? "Deactivate" : "Activate"}</button></td>
          </tr>
        `).join("") || `<tr><td colspan="7">${empty("No products found.")}</td></tr>`}
      </tbody>
    </table>
  `;
}

function inventoryRows(products) {
  return `
    <table>
      <thead><tr><th>Product</th><th>Stock</th><th>Reorder Level</th><th>Status</th><th>Adjustment</th></tr></thead>
      <tbody>
        ${products.map((product) => `
          <tr>
            <td>${escapeHtml(product.name)}</td>
            <td>${product.stock}</td>
            <td>${product.reorder}</td>
            <td>${stockStatus(product)}</td>
            <td><button class="btn small" type="button" data-action="adjustStock" data-id="${product.id}">+1 Adjust</button></td>
          </tr>
        `).join("") || `<tr><td colspan="5">${empty("No inventory results found.")}</td></tr>`}
      </tbody>
    </table>
  `;
}

function stockRows(products) {
  return `
    <table>
      <thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead>
      <tbody>${products.map((product) => `<tr><td>${escapeHtml(product.name)}</td><td>${product.stock}</td><td>${stockStatus(product)}</td></tr>`).join("")}</tbody>
    </table>
  `;
}

function transactionRows(transactions) {
  return `
    <table>
      <thead><tr><th>Receipt No.</th><th>Date</th><th>Cashier</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>
        ${transactions.map((sale) => `
          <tr><td>${sale.receiptNo}</td><td>${sale.date}</td><td>${escapeHtml(sale.cashier)}</td><td>${sale.items || "-"}</td><td>${currency.format(sale.total)}</td><td>${status(sale.status, "active")}</td></tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function returnRows() {
  return `
    <table>
      <thead><tr><th>Return</th><th>Receipt No.</th><th>Date</th><th>Processed By</th><th>Amount</th><th>Reason</th></tr></thead>
      <tbody>
        ${store.data.returns.map((item) => `<tr><td>${item.returnNo}</td><td>${item.receiptNo}</td><td>${item.date}</td><td>${escapeHtml(item.processedBy)}</td><td>${currency.format(item.amount)}</td><td>${escapeHtml(item.reason)}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

function userRows() {
  return `
    <table>
      <thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>
        ${store.data.users.map((user) => `
          <tr><td>${user.id}</td><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.username)}</td><td>${user.role}</td><td>${status(user.status, "active")}</td></tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function cartLine(line) {
  return `
    <div class="cart-line">
      <div>
        <strong>${escapeHtml(line.product.name)}</strong>
        <div class="muted">${currency.format(line.product.price)} each</div>
      </div>
      <div>
        <div class="qty-control">
          <button type="button" data-action="decreaseCart" data-id="${line.productId}">-</button>
          <span>${line.quantity}</span>
          <button type="button" data-action="increaseCart" data-id="${line.productId}">+</button>
        </div>
        <div style="text-align:right;margin-top:6px">${currency.format(line.product.price * line.quantity)}</div>
      </div>
    </div>
  `;
}

function filteredProducts() {
  const term = store.search.toLowerCase();
  return store.data.products.filter((product) =>
    `${product.sku} ${product.name} ${product.category}`.toLowerCase().includes(term)
  );
}

function addToCart(productId) {
  const product = store.data.products.find((item) => item.id === productId);
  if (!product || !product.active || product.stock < 1) return;
  const line = store.cart.find((item) => item.productId === productId);
  if (line && line.quantity < product.stock) line.quantity += 1;
  if (!line) store.cart.push({ productId, quantity: 1 });
}

function changeCartQuantity(productId, change) {
  const line = store.cart.find((item) => item.productId === productId);
  if (!line) return;
  const product = store.data.products.find((item) => item.id === productId);
  line.quantity = Math.min(product.stock, line.quantity + change);
  if (line.quantity <= 0) {
    store.cart = store.cart.filter((item) => item.productId !== productId);
  }
}

function cartLines() {
  return store.cart.map((line) => ({
    ...line,
    product: store.data.products.find((product) => product.id === line.productId)
  }));
}

function cartTotals() {
  const subtotal = cartLines().reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const vat = subtotal * 0.16;
  return { subtotal, vat, total: subtotal + vat };
}

function cartSummary() {
  const totals = cartTotals();
  return `
    <div style="margin-top:14px">
      <div class="summary-row"><span>Subtotal</span><strong>${currency.format(totals.subtotal)}</strong></div>
      <div class="summary-row"><span>VAT 16%</span><strong>${currency.format(totals.vat)}</strong></div>
      <div class="summary-row total"><span>Total</span><span>${currency.format(totals.total)}</span></div>
    </div>
  `;
}

async function checkout() {
  if (!store.cart.length) return;
  const receiptDraft = buildReceiptDraft();
  if (store.apiOnline) {
    const data = await api.post("sales", "checkout", {
      user: store.currentUser,
      cart: store.cart.map((line) => ({ product_id: line.productId, quantity: line.quantity }))
    });
    store.lastReceipt = { ...receiptDraft, ...data.sale };
    store.cart = [];
    await refreshData();
    return;
  }

  cartLines().forEach((line) => {
    line.product.stock -= line.quantity;
  });
  const sale = {
    id: store.data.transactions.length + 1,
    receiptNo: `RCP-${today.replaceAll("-", "")}-${1001 + store.data.transactions.length}`,
    date: today,
    cashier: store.currentUser.name,
    ...receiptDraft,
    status: "Paid"
  };
  store.data.transactions.unshift(sale);
  store.lastReceipt = sale;
  store.cart = [];
}

async function createProduct(data) {
  if (store.apiOnline) {
    await api.post("products", "create", data);
    await refreshData();
    return;
  }
  const values = Object.fromEntries(data.entries());
  const image = data.get("image");
  store.data.products.unshift({
    id: store.data.products.length + 1,
    sku: `P${1001 + store.data.products.length}`,
    name: values.name,
    category: values.category,
    imagePath: image && image.size ? URL.createObjectURL(image) : null,
    price: Number(values.price),
    stock: Number(values.stock),
    reorder: Number(values.reorder_level),
    active: true
  });
}

async function updatePrice(productId) {
  const input = document.querySelector(`[data-price-input="${productId}"]`);
  if (!input) return;
  const price = Number(input.value);
  if (!price || price <= 0) {
    window.alert("Enter a valid price.");
    return;
  }
  if (store.apiOnline) {
    await api.post("products", "updatePrice", { product_id: productId, price });
    await refreshData();
    return;
  }
  const product = store.data.products.find((item) => item.id === productId);
  if (product) product.price = price;
}

async function receiveStock(productId, quantity) {
  if (store.apiOnline) {
    await api.post("products", "receive", { product_id: productId, quantity });
    await refreshData();
    return;
  }
  const product = store.data.products.find((item) => item.id === productId);
  if (product) product.stock += Number(quantity);
}

async function saveInventory(data) {
  const productId = Number(data.product_id);
  const quantity = Number(data.quantity);
  const reorderLevel = Number(data.reorder_level);
  if (!productId || quantity < 1 || reorderLevel < 0) {
    throw new Error("Enter a product, quantity, and reorder level.");
  }
  if (store.apiOnline) {
    await api.post("products", "updateInventory", {
      product_id: productId,
      quantity,
      reorder_level: reorderLevel
    });
    await refreshData();
    return;
  }
  const product = store.data.products.find((item) => item.id === productId);
  if (!product) throw new Error("Product not found.");
  product.stock += quantity;
  product.reorder = reorderLevel;
}

async function toggleProduct(productId) {
  if (store.apiOnline) {
    await api.post("products", "toggle", { product_id: productId });
    await refreshData();
    return;
  }
  const product = store.data.products.find((item) => item.id === productId);
  if (product) product.active = !product.active;
}

async function processReturn(receiptNo) {
  const reason = window.prompt("Reason for return", "Receipt return");
  if (reason === null) return;
  if (store.apiOnline) {
    await api.post("returns", "process", { receipt_no: receiptNo, reason, user: store.currentUser });
    await refreshData();
    return;
  }
  const sale = store.data.transactions.find((item) => item.receiptNo === receiptNo);
  if (!sale || sale.status === "Returned" || store.data.returns.some((item) => item.receiptNo === receiptNo)) {
    window.alert("This receipt has already been returned or was not found.");
    return;
  }
  sale.status = "Returned";
  store.data.returns.unshift({
    id: store.data.returns.length + 1,
    returnNo: `RET-${2001 + store.data.returns.length}`,
    receiptNo,
    date: today,
    processedBy: store.currentUser.name,
    amount: sale.total,
    reason: reason || "Receipt return"
  });
}

async function createUser(data) {
  if (store.apiOnline) {
    await api.post("users", "create", data);
    await refreshData();
    return;
  }
  store.data.users.push({
    id: store.data.users.length + 1,
    name: data.full_name,
    username: data.username,
    password: data.password,
    role: data.role,
    status: "Active"
  });
}

function restoreInputFocus(id, cursorPosition) {
  const input = document.getElementById(id);
  if (!input) return;
  input.focus();
  input.setSelectionRange(cursorPosition, cursorPosition);
}

function productPhoto(product) {
  if (!product.imagePath) {
    return `<span class="product-photo">${initials(product.name)}</span>`;
  }
  return `<span class="product-photo has-image"><span class="image-fallback">${initials(product.name)}</span><img src="${assetUrl(product.imagePath)}" alt="${escapeHtml(product.name)}" onerror="this.remove();this.parentElement.classList.remove('has-image')"></span>`;
}

async function createRole(data) {
  if (store.apiOnline) {
    await api.post("roles", "create", data);
    await refreshData();
    return;
  }
  const name = data.name.trim();
  if (!name || store.data.roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Enter a unique role name.");
  }
  store.data.roles.push({ name, accessLevel: data.access_level });
}

function roleAccessLevel(roleName) {
  return store.currentUser?.accessLevel || store.data.roles.find((role) => role.name === roleName)?.accessLevel || roleName;
}

function buildReceiptDraft() {
  const lines = cartLines();
  return {
    date: today,
    cashier: store.currentUser.name,
    items: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines: lines.map((line) => ({
      name: line.product.name,
      quantity: line.quantity,
      price: line.product.price,
      total: line.product.price * line.quantity
    })),
    ...cartTotals(),
    status: "Paid"
  };
}

function receiptPanel(receipt) {
  if (!receipt) return "";
  const lines = receipt.lines || [];
  return `
    <section class="receipt" aria-live="polite">
      <div class="receipt-heading">
        <div><strong>Receipt generated</strong><span>${escapeHtml(receipt.receiptNo)}</span></div>
        <button class="btn small" type="button" data-action="printReceipt">Print</button>
      </div>
      <div class="receipt-meta">${receipt.date} | ${escapeHtml(receipt.cashier)}</div>
      ${lines.length ? `<div class="receipt-lines">${lines.map((line) => `<div><span>${line.quantity} x ${escapeHtml(line.name)}</span><strong>${currency.format(line.total)}</strong></div>`).join("")}</div>` : ""}
      <div class="receipt-total"><span>Total</span><strong>${currency.format(receipt.total)}</strong></div>
    </section>
  `;
}

function assetUrl(path) {
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  return path.startsWith("../") ? path : `../${path}`;
}

function focusNewRecordForm() {
  const form = document.querySelector(".view-root form");
  if (!form) return;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  form.querySelector("input, select, textarea")?.focus();
}

function exportCurrentView(exportType) {
  const datasets = {
    table: store.data.products,
    products: store.data.products,
    inventory: store.data.products,
    transactions: store.data.transactions,
    returns: store.data.returns,
    users: store.data.users
  };
  const data = datasets[exportType] || datasets[store.currentView] || store.data.products;
  if (!data.length) {
    window.alert("No data to export.");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map((record) => headers.map((header) => csvCell(record[header])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${store.currentView}-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
