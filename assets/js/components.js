export const currency = new Intl.NumberFormat("en-ZM", {
  style: "currency",
  currency: "ZMW",
  maximumFractionDigits: 2
});

export function metric(label, value) {
  return `<article class="card metric" aria-label="${escapeHtml(label)}: ${escapeHtml(value)}"><span>${label}</span><strong>${value}</strong></article>`;
}

export function tableCard(label, content) {
  const headingId = `table-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "")}`;
  return `
    <section class="card" aria-labelledby="${headingId}">
      <div class="card-header"><h3 id="${headingId}" class="card-title">${label}</h3></div>
      <div class="table-wrap" tabindex="0" aria-label="${label}. Scroll horizontally to view all columns.">${content}</div>
    </section>
  `;
}

export function toolbar(placeholder, value = "", exportType = "table", showActions = true) {
  return `
    <div class="toolbar">
      <div class="toolbar-search">
        <label class="toolbar-label" for="search">${placeholder}</label>
        <input id="search" type="search" value="${escapeHtml(value)}" placeholder="Search by name, SKU, or category">
      </div>
      ${showActions ? `<div class="filters">
        <button class="btn" type="button" data-action="exportData" data-export="${exportType}">Export</button>
        <button class="btn primary" type="button" data-action="newRecord">Add New</button>
      </div>` : ""}
    </div>
  `;
}

export function status(label, tone) {
  return `<span class="status ${tone}">${label}</span>`;
}

export function stockStatus(product) {
  if (product.stock === 0) return status("Out", "out");
  if (product.stock <= product.reorder) return status("Low", "low");
  return status("Good", "active");
}

export function empty(message) {
  return `<div class="empty">${message}</div>`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
