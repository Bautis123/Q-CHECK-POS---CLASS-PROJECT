export const currency = new Intl.NumberFormat("en-ZM", {
  style: "currency",
  currency: "ZMW",
  maximumFractionDigits: 2
});

export function metric(label, value) {
  return `<article class="card metric"><span>${label}</span><strong>${value}</strong></article>`;
}

export function tableCard(label, content) {
  return `
    <section class="card">
      <div class="card-header"><h3 class="card-title">${label}</h3></div>
      <div class="table-wrap">${content}</div>
    </section>
  `;
}

export function toolbar(placeholder, value = "", exportType = "table") {
  return `
    <div class="toolbar">
      <input id="search" type="search" value="${escapeHtml(value)}" placeholder="${placeholder}">
      <div class="filters">
        <button class="btn" type="button" data-action="exportData" data-export="${exportType}">Export</button>
        <button class="btn primary" type="button" data-action="newRecord">New</button>
      </div>
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

export function initials(value) {
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
