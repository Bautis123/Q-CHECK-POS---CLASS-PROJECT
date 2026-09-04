export const seedData = {
  products: [
    { id: 1, sku: "P1001", name: "Lenovo ThinkPad E14", category: "Laptops", imagePath: null, price: 18500, stock: 8, reorder: 4, active: true },
    { id: 2, sku: "P1002", name: "Samsung Galaxy A55", category: "Phones", imagePath: "uploads/products/samsung-galaxy-a55.png", price: 9800, stock: 14, reorder: 6, active: true },
    { id: 3, sku: "P1003", name: "Apple iPad 10th Gen", category: "Tablets", imagePath: "uploads/products/ipad-10th-gen.png", price: 14200, stock: 5, reorder: 3, active: true },
    { id: 4, sku: "P1004", name: "JBL Tune Headphones", category: "Audio", imagePath: "uploads/products/jbl-tune-headphones.png", price: 1650, stock: 22, reorder: 8, active: true },
    { id: 5, sku: "P1005", name: "Logitech Wireless Mouse", category: "Accessories", imagePath: "uploads/products/logitech-wireless-mouse.png", price: 420, stock: 32, reorder: 10, active: true },
    { id: 6, sku: "P1006", name: "USB-C Fast Charger", category: "Accessories", imagePath: null, price: 350, stock: 3, reorder: 10, active: true }
  ],
  users: [
    { id: 1, name: "Jonathan Mwale", username: "admin", password: "Admin", role: "Admin", status: "Active" },
    { id: 2, name: "Sereni Banda", username: "manager", password: "Manager", role: "Manager", status: "Active" },
    { id: 3, name: "Bautis Chileshe", username: "cashier", password: "Cashier", role: "Cashier", status: "Active" }
  ],
  transactions: [
    { id: 1, receiptNo: "RCP-20260903-1001", date: "2026-09-03", cashier: "Bautis Chileshe", items: 2, subtotal: 10220, vat: 1635.2, total: 11855.2, status: "Paid" },
    { id: 2, receiptNo: "RCP-20260903-1002", date: "2026-09-03", cashier: "Bautis Chileshe", items: 1, subtotal: 1650, vat: 264, total: 1914, status: "Paid" },
    { id: 3, receiptNo: "RCP-20260902-1003", date: "2026-09-02", cashier: "Sereni Banda", items: 3, subtotal: 19120, vat: 3059.2, total: 22179.2, status: "Paid" }
  ],
  returns: [
    { id: 1, returnNo: "RET-2001", receiptNo: "RCP-20260902-1003", date: "2026-09-02", processedBy: "Sereni Banda", amount: 350, reason: "Faulty unit" }
  ]
};

export const store = {
  currentView: "dashboard",
  search: "",
  receiptLookup: "",
  apiOnline: true,
  cart: [],
  currentUser: null,
  lastReceipt: null,
  data: structuredClone(seedData)
};
