
// Admin SPA: fetch from API endpoints with graceful fallbacks and UI wiring

document.addEventListener("DOMContentLoaded", () => {
  const views = Array.from(document.querySelectorAll(".view"));
  const navItems = Array.from(document.querySelectorAll(".nav-item"));

  function showView(id) {
    views.forEach(v => v.classList.toggle("active", v.id === id));
    navItems.forEach(b => b.classList.toggle("active", b.dataset.target === id));
    // Mobile: close sidebar on selection
    if (window.innerWidth <= 768) {
      document.querySelector(".sidebar").classList.remove("open");
      const overlay = document.getElementById("sidebarOverlay");
      if (overlay) overlay.classList.remove("open");
    }
  }

  navItems.forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.target)));

  // Sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.innerWidth > 768) {
        sidebar.classList.toggle("collapsed");
      } else {
        sidebar.classList.toggle("open");
        if (sidebarOverlay) sidebarOverlay.classList.toggle("open");
      }
    });

    // Close when clicking overlay
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("open");
      });
    }
  }

  // Configurable API base; override by setting window.ADMIN_API_BASE
  const API_BASE = (window.ADMIN_API_BASE || "").replace(/\/$/, "");

  async function apiFetch(path, { method = "GET", data, headers } = {}) {
    const url = `${API_BASE}${path}`;
    const opts = { method, headers: { "Accept": "application/json", ...(headers || {}) } };
    if (data) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(data);
    }
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
  }

  // Fallback loader from local JSON for demo/dev environments
  async function safeJson(url, def = []) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("not ok");
      return await res.json();
    } catch { return def; }
  }

  // Try multiple local JSON paths, return first successful, else default
  async function safeJsonMulti(paths, def = []) {
    for (const p of paths) {
      try {
        const res = await fetch(p);
        if (res.ok) return await res.json();
      } catch { }
    }
    return def;
  }

  const state = {
    products: [], orders: [], customers: [], categories: [], discounts: [], blogs: [], supports: [], refunds: []
  };

  // Normalizers to handle various JSON shapes
  function arr(x) { return Array.isArray(x) ? x : []; }
  function normalizeProducts(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.products)) return res.products;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  }
  function normalizeCategories(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.categories)) return res.categories;
    if (res && Array.isArray(res.items)) return res.items;
    // Derive categories from products fallback JSON (categories/full.json)
    if (res && Array.isArray(res.products)) {
      const map = new Map();
      for (const p of res.products) {
        const name = (p.category || "Uncategorized").trim();
        const subtype = (p.subtype || "").trim();
        if (!map.has(name)) {
          map.set(name, { id: name, name, description: "", tags: [] });
        }
        if (subtype) {
          const c = map.get(name);
          if (!c.tags.includes(subtype)) c.tags.push(subtype);
        }
      }
      return Array.from(map.values());
    }
    return [];
  }

  // API wrappers
  const ProductsAPI = {
    list: () => apiFetch("/api/products").catch(() => safeJson("/data/products.json", [])),
    create: (data) => apiFetch("/api/products", { method: "POST", data }),
    update: (id, data) => apiFetch(`/api/products/${id}`, { method: "PUT", data }),
    remove: (id) => apiFetch(`/api/products/${id}`, { method: "DELETE" })
  };
  const OrdersAPI = {
    list: () => apiFetch("/api/orders").catch(() => safeJsonMulti(["/data/orders.json", "/cart/orderData.json"], [])),
    updateStatus: (id, status) => apiFetch(`/api/orders/${id}`, { method: "PUT", data: { status } })
  };
  const CustomersAPI = {
    list: () => apiFetch("/api/customers").catch(() => safeJson("/data/customers.json", [])),
    create: (data) => apiFetch("/api/customers", { method: "POST", data }),
    update: (id, data) => apiFetch(`/api/customers/${id}`, { method: "PUT", data }),
    remove: (id) => apiFetch(`/api/customers/${id}`, { method: "DELETE" }),
    updateProfile: (data) => apiFetch("/api/customers/profile", { method: "PUT", data })
  };
  const CategoriesAPI = {
    list: () => apiFetch("/api/categories").catch(() => safeJson("/categories/full.json", [])),
    create: (data) => apiFetch("/api/categories", { method: "POST", data }),
    update: (id, data) => apiFetch(`/api/categories/${id}`, { method: "PUT", data }),
    remove: (id) => apiFetch(`/api/categories/${id}`, { method: "DELETE" })
  };
  const DiscountsAPI = {
    list: async () => {
      // Try server first; when unavailable, generate codes based on Sale data
      try { return await apiFetch("/api/discounts"); } catch { }
      // Generate segment-based discount codes tied to items that are on sale
      const saleData = await safeJson("/Sale/products.json", { products: [] });
      const products = normalizeProducts(saleData);
      const saleItems = products.filter(p => p && p.originalPrice && Number(p.originalPrice) > Number(p.price || 0));
      const saleIds = saleItems.map(p => p.id);
      const saleBrands = Array.from(new Set(saleItems.map(p => String(p.brand || "").trim()).filter(Boolean)));
      const make = (code, type, value, segment, note) => ({
        code, type, value, active: true,
        appliesTo: { productIds: saleIds, brands: saleBrands, saleOnly: true },
        conditions: { segment, minLifetimeSpend: segment === "loyal_over_100" ? 100 : undefined },
        note
      });
      const discounts = [
        make("WELCOME10", "percent", 0.10, "first_login", "10% off for first-time login users on sale items"),
        make("FIRSTBUY15", "percent", 0.15, "first_order", "15% off first purchase, sale items only"),
        make("BDAY20", "percent", 0.20, "birthday_month", "Celebrate your birthday month with 20% off"),
        make("LOYAL5", "amount", 5, "loyal_over_100", "$5 off for customers with $100+ past spend")
      ];
      return discounts;
    },
    create: (data) => apiFetch("/api/discounts", { method: "POST", data }),
    update: (code, data) => apiFetch(`/api/discounts/${code}`, { method: "PUT", data }),
    toggle: (code) => apiFetch(`/api/discounts/${code}/toggle`, { method: "PUT" }).catch(() => null),
    remove: (code) => apiFetch(`/api/discounts/${code}`, { method: "DELETE" }).catch(() => null)
  };
  const BlogsAPI = {
    list: () => apiFetch("/api/blogs").catch(() => []),
    create: (data) => apiFetch("/api/blogs", { method: "POST", data }),
    update: (id, data) => apiFetch(`/api/blogs/${id}`, { method: "PUT", data }),
    remove: (id) => apiFetch(`/api/blogs/${id}`, { method: "DELETE" })
  };
  // Local overrides persisted in browser for demo actions
  const overrides = {
    support: (() => { try { return JSON.parse(localStorage.getItem("admin.supportOverrides") || "{}"); } catch { return {}; } })(),
    refunds: (() => { try { return JSON.parse(localStorage.getItem("admin.refundOverrides") || "{}"); } catch { return {}; } })()
  };
  function setOverride(type, id, patch) {
    const key = type === "support" ? "admin.supportOverrides" : "admin.refundOverrides";
    const obj = type === "support" ? overrides.support : overrides.refunds;
    obj[id] = { ...(obj[id] || {}), ...patch };
    localStorage.setItem(key, JSON.stringify(obj));
  }
  const SupportAPI = {
    list: async () => {
      const base = await apiFetch("/api/support").catch(() => safeJson("/admin/support.json", []));
      return (Array.isArray(base) ? base : []).map(s => ({ ...s, ...(overrides.support[s.id] || {}) }));
    },
    assign: async (id) => {
      try { await apiFetch(`/api/support/${id}/assign`, { method: "PUT" }); }
      catch {
        const today = new Date().toISOString().slice(0, 10);
        setOverride("support", id, { status: "In Progress", assignedTo: "Admin", updatedAt: today });
      }
    }
  };
  const RefundsAPI = {
    list: async () => {
      const base = await apiFetch("/api/refunds").catch(() => safeJson("/admin/refunds.json", []));
      return (Array.isArray(base) ? base : []).map(r => ({ ...r, ...(overrides.refunds[r.id] || {}) }));
    },
    review: async (id, decision) => {
      try { await apiFetch(`/api/refunds/${id}/review`, { method: "PUT", data: { decision } }); }
      catch {
        const today = new Date().toISOString().slice(0, 10);
        const map = { approve: "Approved", reject: "Rejected", review: "Reviewing" };
        const status = map[decision] || "Reviewing";
        setOverride("refunds", id, { status, resolvedAt: today });
      }
    }
  };

  // Render helpers
  function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = String(val); }
  function renderTable(tableId, rowsHtml) { const tbody = document.querySelector(`#${tableId} tbody`); if (tbody) tbody.innerHTML = rowsHtml.join(""); }

  function renderProducts() {
    renderTable("productsTable", state.products.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>$${Number(p.price || 0).toFixed(2)}</td>
        <td>${p.available ? "In stock" : "Out of stock"}</td>
        <td>
          <button class="btn" data-action="view" data-id="${p.id}">View</button>
          <button class="btn" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn" data-action="delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `));
  }
  function renderOrders() {
    renderTable("ordersTable", state.orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customer || o.customerName || "-"}</td>
        <td>${o.total != null ? `$${Number(o.total).toFixed(2)}` : "-"}</td>
        <td>${o.status || "-"}</td>
        <td>${o.eta || o.expectedDate || "-"}</td>
        <td>
          <button class="btn" data-action="track" data-id="${o.id}">Track</button>
          <button class="btn" data-action="status" data-id="${o.id}">Update Status</button>
        </td>
      </tr>
    `));
  }
  function renderCustomers() {
    const countsById = {};
    const countsByName = {};
    (state.orders || []).forEach(o => {
      if (o.customerId != null) {
        const k = String(o.customerId);
        countsById[k] = (countsById[k] || 0) + 1;
      }
      if (o.customer) {
        const k = String(o.customer);
        countsByName[k] = (countsByName[k] || 0) + 1;
      }
    });
    renderTable("customersTable", state.customers.map(c => {
      const count = countsById[String(c.id)] ?? countsByName[String(c.name)] ?? 0;
      return `
      <tr>
        <td>${c.id}</td>
        <td><span>${c.name}</span>${count ? `<span class="badge" title="Orders">${count}</span>` : ""}</td>
        <td>${c.email}</td>
        <td>${c.phone || ""}</td>
        <td>
          <button class="btn" data-action="view-orders" data-id="${c.id}" data-name="${c.name}">View Orders</button>
          <button class="btn" data-action="manage" data-id="${c.id}">Manage</button>
        </td>
      </tr>`;
    }));
  }
  function renderCategories() {
    const categoriesList = document.getElementById("categoriesList");
    if (!categoriesList) return;
    const cats = Array.isArray(state.categories) ? state.categories : [];
    categoriesList.innerHTML = cats.map(cat => `
      <li class="list-item">
        <span>${cat.name || cat.category || "Unnamed"}</span>
        <div class="actions">
          <button class="btn" data-action="edit-category" data-id="${cat.id || cat.name}">Edit</button>
          <button class="btn" data-action="delete-category" data-id="${cat.id || cat.name}">Delete</button>
        </div>
      </li>
    `).join("");
  }
  function renderDiscounts() {
    const tbody = document.querySelector(`#codesTable tbody`);
    if (!tbody) return;
    const rows = (state.discounts || []).map(d => `
      <tr>
        <td>${d.code || d.name || ""}</td>
        <td>${d.type || (d.value && Number(d.value) < 1 ? "percent" : "amount")}</td>
        <td>${d.value != null ? d.value : (d.amount != null ? d.amount : "-")}</td>
        <td>${d.active ? "Yes" : "No"}</td>
        <td>
          <button class="btn" data-action="toggle-discount" data-code="${d.code}">Toggle</button>
          <button class="btn" data-action="edit-discount" data-code="${d.code}">Edit</button>
          <button class="btn" data-action="delete-discount" data-code="${d.code}">Delete</button>
        </td>
      </tr>
    `);
    tbody.innerHTML = rows.join("");
  }
  function renderBlogs() {
    const blogsList = document.getElementById("blogsList");
    if (!blogsList) return;
    blogsList.innerHTML = (state.blogs || []).map(b => `
      <li class="list-item">
        <span>${b.title} — ${b.author || ""}</span>
        <div class="actions">
          <button class="btn" data-action="edit-blog" data-id="${b.id}">Edit</button>
          <button class="btn" data-action="delete-blog" data-id="${b.id}">Delete</button>
        </div>
      </li>
    `).join("");
  }
  function renderSupport() {
    renderTable("supportTable", (state.supports || []).map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.user || s.customer || ""}</td>
        <td>${s.subject || s.title || ""}</td>
        <td>${s.status || "Open"}</td>
        <td><button class="btn" data-action="assign" data-id="${s.id}">Assign</button></td>
      </tr>
    `));
  }
  function renderRefunds() {
    renderTable("refundsTable", (state.refunds || []).map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.order || r.orderId || ""}</td>
        <td>${r.reason || ""}</td>
        <td>${r.status || "Reviewing"}</td>
        <td><button class="btn" data-action="review" data-id="${r.id}">Review</button></td>
      </tr>
    `));
  }

  function renderAll() {
    renderProducts();
    renderOrders();
    renderCustomers();
    renderCategories();
    renderDiscounts();
    renderBlogs();
    renderSupport();
    renderRefunds();
    setText("statOrders", state.orders.length);
    setText("statProducts", state.products.length);
    setText("statCustomers", state.customers.length);
    setText("statRefunds", state.refunds.length);
    renderDashboardCharts();
  }

  async function loadAll() {
    const [products, orders, customers, categories, discounts, blogs, supports, refunds] = await Promise.all([
      ProductsAPI.list(), OrdersAPI.list(), CustomersAPI.list(), CategoriesAPI.list(), DiscountsAPI.list(), BlogsAPI.list(), SupportAPI.list(), RefundsAPI.list()
    ]);
    state.products = normalizeProducts(products);
    state.orders = arr(orders);
    state.customers = arr(customers);
    state.categories = normalizeCategories(categories);
    state.discounts = arr(discounts);
    state.blogs = arr(blogs);
    state.supports = arr(supports);
    state.refunds = arr(refunds);
    renderAll();
  }

  // Product modal
  const modal = document.getElementById("productModal");
  const modalBody = document.getElementById("modalBody");
  const modalTitle = document.getElementById("modalTitle");
  const modalClose = document.getElementById("modalClose");

  function openProductModal(productId) {
    const p = state.products.find(x => String(x.id) === String(productId));
    if (!p || !modal || !modalBody || !modalTitle) return;
    modalTitle.textContent = `${p.name}`;
    modalBody.innerHTML = `
      <div class="grid-2">
        <div>
          <strong>Brand:</strong> ${p.brand || "-"}<br/>
          <strong>Price:</strong> $${Number(p.price || 0).toFixed(2)}<br/>
          <strong>Availability:</strong> ${p.available ? "In stock" : "Out of stock"}<br/>
        </div>
        <div>
          <strong>Specs:</strong> ${p.specs || ""}<br/>
          <strong>Reviews:</strong> ${p.reviews || 0}
        </div>
      </div>
    `;
    modal.hidden = false;
  }
  function closeModal() { if (modal) modal.hidden = true; }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Product manage modal (Create/Update/Delete)
  const productManageModal = document.getElementById("productManageModal");
  const productManageTitle = document.getElementById("productManageTitle");
  const productManageClose = document.getElementById("productManageClose");
  const productForm = document.getElementById("productForm");
  const deleteProductBtn = document.getElementById("deleteProductBtn");

  function validateProduct(p) {
    if (!p.name || p.name.trim().length < 2) return "Name must be at least 2 characters.";
    const priceNum = Number(p.price);
    if (Number.isNaN(priceNum) || priceNum < 0) return "Price must be a non-negative number.";
    return "";
  }

  function openProductManageModal(product) {
    if (!productManageModal || !productForm) return;
    productManageModal.hidden = false;
    productManageTitle.textContent = product && product.id ? "Edit Product" : "Add Product";
    productForm.reset();
    const idInput = productForm.querySelector('input[name="id"]');
    const nameInput = productForm.querySelector('input[name="name"]');
    const brandInput = productForm.querySelector('input[name="brand"]');
    const priceInput = productForm.querySelector('input[name="price"]');
    const availableInput = productForm.querySelector('input[name="available"]');
    const specsInput = productForm.querySelector('textarea[name="specs"]');
    if (product) {
      idInput.value = product.id ?? "";
      nameInput.value = product.name ?? "";
      brandInput.value = product.brand ?? "";
      priceInput.value = product.price ?? 0;
      availableInput.checked = !!product.available;
      specsInput.value = product.specs ?? "";
      if (deleteProductBtn) deleteProductBtn.style.display = "inline-flex";
    } else {
      idInput.value = "";
      availableInput.checked = true;
      if (deleteProductBtn) deleteProductBtn.style.display = "none";
    }
  }

  function closeProductManageModal() { if (productManageModal) productManageModal.hidden = true; }
  productManageClose?.addEventListener("click", closeProductManageModal);

  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(productForm);
      const payload = Object.fromEntries(fd.entries());
      payload.name = (payload.name || "").trim();
      payload.brand = (payload.brand || "").trim();
      payload.price = Number(payload.price || 0);
      payload.available = !!payload.available;
      payload.specs = (payload.specs || "").trim();
      const error = validateProduct(payload);
      if (error) { alert(error); return; }
      try {
        if (payload.id) {
          await ProductsAPI.update(payload.id, { name: payload.name, brand: payload.brand, price: payload.price, available: payload.available, specs: payload.specs });
        } else {
          await ProductsAPI.create({ name: payload.name, brand: payload.brand, price: payload.price, available: payload.available, specs: payload.specs });
        }
      } catch (err) { alert("Save product failed."); return; }
      closeProductManageModal();
      await loadAll();
    });
  }

  if (deleteProductBtn && productForm) {
    deleteProductBtn.addEventListener("click", async () => {
      const id = productForm.querySelector('input[name="id"]').value;
      if (!id) { alert("No product selected."); return; }
      if (!confirm("Delete this product?")) return;
      try { await ProductsAPI.remove(id); }
      catch { alert("Delete failed."); return; }
      closeProductManageModal();
      await loadAll();
    });
  }

  // Table delegation for product actions
  const productsTable = document.getElementById("productsTable");
  if (productsTable) {
    productsTable.addEventListener("click", async (e) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const btn = target ? target.closest("button") : null;
      if (!btn) return;
      const action = btn.dataset.action; const id = btn.dataset.id;
      try {
        if (action === "view") openProductModal(id);
        if (action === "edit") {
          const p = state.products.find(x => String(x.id) === String(id));
          if (!p) return;
          openProductManageModal(p);
        }
        if (action === "delete") {
          await ProductsAPI.remove(id);
          await loadAll();
        }
      } catch (err) { console.error(err); alert("Product action failed."); }
    });
  }

  // Add Product
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => openProductManageModal(null));
  }

  // Orders actions
  const ordersTable = document.getElementById("ordersTable");
  if (ordersTable) {
    ordersTable.addEventListener("click", async (e) => {
      const btn = (e.target instanceof HTMLElement) ? e.target.closest("button") : null; if (!btn) return;
      const action = btn.dataset.action; const id = btn.dataset.id;
      if (action === "track") alert(`Tracking ${id}`);
      if (action === "status") { try { await OrdersAPI.updateStatus(id, "Processing"); await loadAll(); } catch { alert("Update status failed."); } }
    });
  }

  // ================= Customers: CRUD with validation =================
  const customerModal = document.getElementById("customerModal");
  const customerModalTitle = document.getElementById("customerModalTitle");
  const customerModalClose = document.getElementById("customerModalClose");
  const customerForm = document.getElementById("customerForm");
  const deleteCustomerBtn = document.getElementById("deleteCustomerBtn");
  const addCustomerBtn = document.getElementById("addCustomerBtn");

  function openCustomerModal(customer) {
    if (!customerModal || !customerForm) return;
    customerModal.hidden = false;
    customerModalTitle.textContent = customer && customer.id ? "Edit Customer" : "Add Customer";
    customerForm.reset();
    const idInput = customerForm.querySelector('input[name="id"]');
    const nameInput = customerForm.querySelector('input[name="name"]');
    const emailInput = customerForm.querySelector('input[name="email"]');
    const phoneInput = customerForm.querySelector('input[name="phone"]');
    if (customer) {
      idInput.value = customer.id ?? "";
      nameInput.value = customer.name ?? "";
      emailInput.value = customer.email ?? "";
      phoneInput.value = customer.phone ?? "";
      if (deleteCustomerBtn) deleteCustomerBtn.style.display = "inline-flex";
    } else {
      idInput.value = "";
      if (deleteCustomerBtn) deleteCustomerBtn.style.display = "none";
    }
  }

  function closeCustomerModal() { if (customerModal) customerModal.hidden = true; }
  customerModalClose?.addEventListener("click", closeCustomerModal);

  function validateCustomer(data) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.name || data.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!data.email || !emailRe.test(data.email)) return "Please enter a valid email address.";
    if (data.phone && data.phone.replace(/\D/g, '').length < 9) return "Phone number seems invalid.";
    return "";
  }

  // Table manage -> open modal
  const customersTable = document.getElementById("customersTable");
  if (customersTable) {
    customersTable.addEventListener("click", (e) => {
      const btn = (e.target instanceof HTMLElement) ? e.target.closest("button") : null; if (!btn) return;
      const action = btn.dataset.action;
      if (action === "manage") {
        const id = btn.dataset.id;
        const c = state.customers.find(x => String(x.id) === String(id));
        openCustomerModal(c);
      } else if (action === "view-orders") {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const url = `/customerorders.html?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
        window.location.href = url;
      }
    });
  }

  // Add Customer button
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener("click", () => openCustomerModal(null));
  }

  // Save (create/update)
  if (customerForm) {
    customerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(customerForm);
      const payload = Object.fromEntries(formData.entries());
      // normalize
      payload.name = (payload.name || "").trim();
      payload.email = (payload.email || "").trim();
      payload.phone = (payload.phone || "").trim();
      const error = validateCustomer(payload);
      if (error) { alert(error); return; }
      try {
        if (payload.id) {
          await CustomersAPI.update(payload.id, { name: payload.name, email: payload.email, phone: payload.phone });
        } else {
          await CustomersAPI.create({ name: payload.name, email: payload.email, phone: payload.phone });
        }
      } catch (err) {
        alert("Save failed. Please check inputs and try again.");
        return;
      }
      closeCustomerModal();
      await loadAll();
    });
  }

  // ================= Dashboard Charts =================
  let charts = { revenue: null, status: null, inventory: null };
  const dashboardFilters = {
    range: '30d', // 7d, 30d, 90d, all
    group: 'day'  // day, month
  };

  function getOrderDate(o) {
    const d = o.paidAt || o.createdAt || o.eta || o.expectedDate;
    return d ? new Date(d) : null;
  }

  function inRange(date) {
    if (!date || dashboardFilters.range === 'all') return true;
    const now = new Date();
    const days = dashboardFilters.range === '7d' ? 7 : dashboardFilters.range === '30d' ? 30 : 90;
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    return date >= start && date <= now;
  }

  function renderDashboardCharts() {
    // Ensure Chart.js and canvases exist
    if (typeof Chart === "undefined") return;
    const revCanvas = document.getElementById("chartRevenue");
    const statusCanvas = document.getElementById("chartStatus");
    const invCanvas = document.getElementById("chartInventory");
    if (!revCanvas || !statusCanvas || !invCanvas) return;

    // Destroy previous charts to avoid duplicates
    try { charts.revenue && charts.revenue.destroy && charts.revenue.destroy(); } catch { }
    try { charts.status && charts.status.destroy && charts.status.destroy(); } catch { }
    try { charts.inventory && charts.inventory.destroy && charts.inventory.destroy(); } catch { }

    // Revenue by date or month
    const byKey = {};
    (state.orders || []).forEach(o => {
      const date = getOrderDate(o);
      if (!date || !inRange(date)) return;
      const key = dashboardFilters.group === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : date.toISOString().slice(0, 10);
      const amount = Number(o.total || 0) || 0;
      byKey[key] = (byKey[key] || 0) + amount;
    });
    const revLabels = Object.keys(byKey).sort();
    const revData = revLabels.map(d => byKey[d]);
    charts.revenue = new Chart(revCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: revLabels,
        datasets: [{ label: "Doanh thu", data: revData, borderColor: "#C78693", backgroundColor: "rgba(231, 142, 152, .2)", tension: .25 }]
      },
      options: { plugins: { legend: { display: true } }, scales: { y: { ticks: { callback: v => `$${Number(v).toFixed(0)}` } } } }
    });

    // Order statuses
    const statusCounts = {};
    (state.orders || []).forEach(o => { const s = o.status || "Unknown"; statusCounts[s] = (statusCounts[s] || 0) + 1; });
    const statusLabels = Object.keys(statusCounts);
    const statusData = statusLabels.map(l => statusCounts[l]);
    charts.status = new Chart(statusCanvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: statusLabels,
        datasets: [{ data: statusData, backgroundColor: ["#E6A6B0", "#C78693", "#A76A79", "#8C5562", "#6B4C3B"] }]
      },
      options: { plugins: { legend: { position: "bottom" } } }
    });

    // Inventory by category (sum quantity/stock if available, else count)
    const catCounts = {};
    (state.products || []).forEach(p => {
      const cat = (p.category || p.type || "Uncategorized");
      const qty = Number(p.quantity ?? p.stock ?? 1) || 1;
      catCounts[cat] = (catCounts[cat] || 0) + qty;
    });
    const invLabels = Object.keys(catCounts);
    const invData = invLabels.map(l => catCounts[l]);
    charts.inventory = new Chart(invCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: invLabels,
        datasets: [{ label: "Tồn kho", data: invData, backgroundColor: "#E6A6B0" }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }

  // Dashboard filter controls
  const rangeSel = document.getElementById('dashboardRange');
  const groupSel = document.getElementById('dashboardGroup');
  if (rangeSel) rangeSel.addEventListener('change', () => { dashboardFilters.range = rangeSel.value; renderDashboardCharts(); });
  if (groupSel) groupSel.addEventListener('change', () => { dashboardFilters.group = groupSel.value; renderDashboardCharts(); });

  // Delete
  if (deleteCustomerBtn && customerForm) {
    deleteCustomerBtn.addEventListener("click", async () => {
      const id = customerForm.querySelector('input[name="id"]').value;
      if (!id) { alert("No customer selected."); return; }
      if (!confirm("Delete this customer? This action cannot be undone.")) return;
      try { await CustomersAPI.remove(id); }
      catch { alert("Delete failed."); return; }
      closeCustomerModal();
      await loadAll();
    });
  }

  // Profile submit
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(profileForm);
      const payload = Object.fromEntries(formData.entries());
      try { await CustomersAPI.updateProfile(payload); alert("Profile saved"); }
      catch { alert("Save failed (demo)"); }
    });
  }

  // ================= Categories: CRUD with validation =================
  const categoryModal = document.getElementById("categoryModal");
  const categoryModalTitle = document.getElementById("categoryModalTitle");
  const categoryModalClose = document.getElementById("categoryModalClose");
  const categoryForm = document.getElementById("categoryForm");
  const deleteCategoryBtn = document.getElementById("deleteCategoryBtn");
  const addCategoryBtn = document.getElementById("addCategoryBtn");

  function validateCategory(c) {
    if (!c.title || c.title.trim().length < 2) return "Title must be at least 2 characters.";
    return "";
  }
  function openCategoryModal(category) {
    if (!categoryModal || !categoryForm) return;
    categoryModal.hidden = false;
    categoryModalTitle.textContent = category && (category.id || category.name) ? "Edit Category" : "Add Category";
    categoryForm.reset();
    const idInput = categoryForm.querySelector('input[name="id"]');
    const titleInput = categoryForm.querySelector('input[name="title"]');
    const descriptionInput = categoryForm.querySelector('textarea[name="description"]');
    const tagsInput = categoryForm.querySelector('input[name="tags"]');
    if (category) {
      idInput.value = category.id ?? category.name ?? "";
      titleInput.value = category.name ?? category.title ?? "";
      descriptionInput.value = category.description ?? "";
      tagsInput.value = Array.isArray(category.tags) ? category.tags.join(", ") : (category.tags || "");
      if (deleteCategoryBtn) deleteCategoryBtn.style.display = "inline-flex";
    } else {
      idInput.value = "";
      if (deleteCategoryBtn) deleteCategoryBtn.style.display = "none";
    }
  }
  function closeCategoryModal() { if (categoryModal) categoryModal.hidden = true; }
  categoryModalClose?.addEventListener("click", closeCategoryModal);
  addCategoryBtn?.addEventListener("click", () => openCategoryModal(null));
  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(categoryForm);
      const payload = Object.fromEntries(fd.entries());
      payload.title = (payload.title || "").trim();
      payload.description = (payload.description || "").trim();
      payload.tags = (payload.tags || "").split(',').map(s => s.trim()).filter(Boolean);
      const error = validateCategory(payload);
      if (error) { alert(error); return; }
      try {
        if (payload.id) {
          await CategoriesAPI.update(payload.id, { name: payload.title, description: payload.description, tags: payload.tags });
        } else {
          await CategoriesAPI.create({ name: payload.title, description: payload.description, tags: payload.tags });
        }
      } catch (err) { alert("Save category failed."); return; }
      closeCategoryModal();
      await loadAll();
    });
  }
  deleteCategoryBtn?.addEventListener("click", async () => {
    const id = categoryForm?.querySelector('input[name="id"]').value;
    if (!id) { alert("No category selected."); return; }
    if (!confirm("Delete this category?")) return;
    try { await CategoriesAPI.remove(id); }
    catch { alert("Delete failed."); return; }
    closeCategoryModal();
    await loadAll();
  });

  // ================= Blogs: CRUD with validation =================
  const blogModal = document.getElementById("blogModal");
  const blogModalTitle = document.getElementById("blogModalTitle");
  const blogModalClose = document.getElementById("blogModalClose");
  const blogForm = document.getElementById("blogForm");
  const deleteBlogBtn = document.getElementById("deleteBlogBtn");
  const addBlogBtn = document.getElementById("addBlogBtn");

  function validateBlog(b) {
    if (!b.title || b.title.trim().length < 2) return "Title must be at least 2 characters.";
    if (!b.body || b.body.trim().length < 10) return "Body must be at least 10 characters.";
    return "";
  }
  function openBlogModal(blog) {
    if (!blogModal || !blogForm) return;
    blogModal.hidden = false;
    blogModalTitle.textContent = blog && blog.id ? "Edit Blog" : "New Blog";
    blogForm.reset();
    const idInput = blogForm.querySelector('input[name="id"]');
    const titleInput = blogForm.querySelector('input[name="title"]');
    const authorInput = blogForm.querySelector('input[name="author"]');
    const imagesInput = blogForm.querySelector('input[name="images"]');
    const tagsInput = blogForm.querySelector('input[name="tags"]');
    const bodyInput = blogForm.querySelector('textarea[name="body"]');
    if (blog) {
      idInput.value = blog.id ?? "";
      titleInput.value = blog.title ?? "";
      authorInput.value = blog.author ?? "";
      imagesInput.value = Array.isArray(blog.images) ? blog.images.join(", ") : (blog.images || "");
      tagsInput.value = Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || "");
      bodyInput.value = blog.body ?? "";
      if (deleteBlogBtn) deleteBlogBtn.style.display = "inline-flex";
    } else {
      idInput.value = "";
      if (deleteBlogBtn) deleteBlogBtn.style.display = "none";
    }
  }
  function closeBlogModal() { if (blogModal) blogModal.hidden = true; }
  blogModalClose?.addEventListener("click", closeBlogModal);
  addBlogBtn?.addEventListener("click", () => openBlogModal(null));
  if (blogForm) {
    blogForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(blogForm);
      const payload = Object.fromEntries(fd.entries());
      payload.title = (payload.title || "").trim();
      payload.author = (payload.author || "").trim();
      payload.images = (payload.images || "").split(',').map(s => s.trim()).filter(Boolean);
      payload.tags = (payload.tags || "").split(',').map(s => s.trim()).filter(Boolean);
      payload.body = (payload.body || "").trim();
      const error = validateBlog(payload);
      if (error) { alert(error); return; }
      try {
        if (payload.id) {
          await BlogsAPI.update(payload.id, { title: payload.title, author: payload.author, images: payload.images, tags: payload.tags, body: payload.body });
        } else {
          await BlogsAPI.create({ title: payload.title, author: payload.author, images: payload.images, tags: payload.tags, body: payload.body });
        }
      } catch (err) { alert("Save blog failed."); return; }
      closeBlogModal();
      await loadAll();
    });
  }
  deleteBlogBtn?.addEventListener("click", async () => {
    const id = blogForm?.querySelector('input[name="id"]').value;
    if (!id) { alert("No blog selected."); return; }
    if (!confirm("Delete this blog post?")) return;
    try { await BlogsAPI.remove(id); }
    catch { alert("Delete failed."); return; }
    closeBlogModal();
    await loadAll();
  });

  // ================= Discounts/Promotions: CRUD with validation =================
  const discountModal = document.getElementById("discountModal");
  const discountModalTitle = document.getElementById("discountModalTitle");
  const discountModalClose = document.getElementById("discountModalClose");
  const discountForm = document.getElementById("discountForm");
  const deleteDiscountBtn = document.getElementById("deleteDiscountBtn");
  const addCodeBtn = document.getElementById("addCodeBtn");

  function validateDiscount(d) {
    if (!d.code || d.code.trim().length < 2) return "Code/Name must be at least 2 characters.";
    const valNum = Number(d.value);
    if (Number.isNaN(valNum) || valNum <= 0) return "Value must be a positive number.";
    return "";
  }
  function openDiscountModal(discount) {
    if (!discountModal || !discountForm) return;
    discountModal.hidden = false;
    discountModalTitle.textContent = discount && (discount.code || discount.name) ? "Edit Promotion" : "New Promotion";
    discountForm.reset();
    const idInput = discountForm.querySelector('input[name="id"]');
    const codeInput = discountForm.querySelector('input[name="code"]');
    const typeInput = discountForm.querySelector('select[name="type"]');
    const valueInput = discountForm.querySelector('input[name="value"]');
    const appliesInput = discountForm.querySelector('input[name="applies"]');
    const startInput = discountForm.querySelector('input[name="start"]');
    const endInput = discountForm.querySelector('input[name="end"]');
    const limitInput = discountForm.querySelector('input[name="limit"]');
    const activeInput = discountForm.querySelector('input[name="active"]');
    if (discount) {
      idInput.value = discount.code ?? discount.id ?? "";
      codeInput.value = discount.code ?? discount.name ?? "";
      typeInput.value = discount.type ?? (discount.value && Number(discount.value) < 1 ? "percent" : "amount");
      valueInput.value = discount.value ?? discount.amount ?? 0;
      appliesInput.value = Array.isArray(discount.applies) ? discount.applies.join(',') : (discount.applies || "");
      startInput.value = discount.start ?? "";
      endInput.value = discount.end ?? "";
      limitInput.value = discount.limit ?? "";
      activeInput.checked = !!discount.active;
      if (deleteDiscountBtn) deleteDiscountBtn.style.display = "inline-flex";
    } else {
      idInput.value = "";
      activeInput.checked = true;
      if (deleteDiscountBtn) deleteDiscountBtn.style.display = "none";
    }
  }
  function closeDiscountModal() { if (discountModal) discountModal.hidden = true; }
  discountModalClose?.addEventListener("click", closeDiscountModal);
  addCodeBtn?.addEventListener("click", () => openDiscountModal(null));
  if (discountForm) {
    discountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(discountForm);
      const payload = Object.fromEntries(fd.entries());
      payload.code = (payload.code || "").trim();
      payload.type = payload.type || "amount";
      payload.value = Number(payload.value || 0);
      payload.applies = (payload.applies || "").split(',').map(s => s.trim()).filter(Boolean);
      payload.start = payload.start || null;
      payload.end = payload.end || null;
      payload.limit = payload.limit ? Number(payload.limit) : null;
      payload.active = !!payload.active;
      const error = validateDiscount(payload);
      if (error) { alert(error); return; }
      try {
        if (payload.id) {
          await DiscountsAPI.update(payload.id, { code: payload.code, type: payload.type, value: payload.value, applies: payload.applies, start: payload.start, end: payload.end, limit: payload.limit, active: payload.active });
        } else {
          await DiscountsAPI.create({ code: payload.code, type: payload.type, value: payload.value, applies: payload.applies, start: payload.start, end: payload.end, limit: payload.limit, active: payload.active });
        }
      } catch (err) { alert("Save promotion failed."); return; }
      closeDiscountModal();
      await loadAll();
    });
  }
  deleteDiscountBtn?.addEventListener("click", async () => {
    const id = discountForm?.querySelector('input[name="id"]').value;
    if (!id) { alert("No promotion selected."); return; }
    if (!confirm("Delete this promotion?")) return;
    try { await DiscountsAPI.remove(id); }
    catch { alert("Delete failed."); return; }
    closeDiscountModal();
    await loadAll();
  });

  // Discounts/Categories/Blogs/Support/Refunds delegated actions (demo with API calls where possible)
  document.addEventListener("click", async (e) => {
    const btn = (e.target instanceof HTMLElement) ? e.target.closest("button") : null; if (!btn) return;
    const action = btn.dataset.action;
    try {
      if (action === "toggle-discount") { await DiscountsAPI.toggle(btn.dataset.code); await loadAll(); }
      if (action === "edit-discount") {
        const d = (state.discounts || []).find(x => String(x.code) === String(btn.dataset.code));
        openDiscountModal(d);
      }
      if (action === "delete-discount") { await DiscountsAPI.remove(btn.dataset.code); await loadAll(); }
      if (action === "edit-category") {
        const c = (state.categories || []).find(x => String(x.id || x.name) === String(btn.dataset.id));
        openCategoryModal(c);
      }
      if (action === "delete-category") { await CategoriesAPI.remove(btn.dataset.id); await loadAll(); }
      if (action === "edit-blog") {
        const b = (state.blogs || []).find(x => String(x.id) === String(btn.dataset.id));
        openBlogModal(b);
      }
      if (action === "delete-blog") { await BlogsAPI.remove(btn.dataset.id); await loadAll(); }
      if (action === "assign") { await SupportAPI.assign(btn.dataset.id); await loadAll(); }
      if (action === "review") { await RefundsAPI.review(btn.dataset.id, "approve"); await loadAll(); }
    } catch (err) { console.error(err); }
  });

  // Initial load
  loadAll();
});
