const state = {
  categories: [],
  products: [],
  activeCategory: 0,
  search: "",
  order: loadOrder(),
  selectedProduct: null,
  ready: false,
};

const els = {
  pageMeta: document.querySelector("#pageMeta"),
  pageTitle: document.querySelector("#pageTitle"),
  categoryStrip: document.querySelector("#categoryStrip"),
  categoryCounter: document.querySelector("#categoryCounter"),
  categoryTitle: document.querySelector("#categoryTitle"),
  productCount: document.querySelector("#productCount"),
  productGrid: document.querySelector("#productGrid"),
  searchInput: document.querySelector("#searchInput"),
  menuButton: document.querySelector("#menuButton"),
  menuPanel: document.querySelector("#menuPanel"),
  menuList: document.querySelector("#menuList"),
  closeMenu: document.querySelector("#closeMenu"),
  closeMenuScrim: document.querySelector("#closeMenuScrim"),
  backButton: document.querySelector("#backButton"),
  nextButton: document.querySelector("#nextButton"),
  openOrder: document.querySelector("#openOrder"),
  closeOrder: document.querySelector("#closeOrder"),
  closeOrderScrim: document.querySelector("#closeOrderScrim"),
  orderPanel: document.querySelector("#orderPanel"),
  orderItems: document.querySelector("#orderItems"),
  orderTotal: document.querySelector("#orderTotal"),
  orderTotalTop: document.querySelector("#orderTotalTop"),
  clearOrder: document.querySelector("#clearOrder"),
  copyOrder: document.querySelector("#copyOrder"),
  extrasDialog: document.querySelector("#extrasDialog"),
  extrasCategory: document.querySelector("#extrasCategory"),
  extrasTitle: document.querySelector("#extrasTitle"),
  extrasBody: document.querySelector("#extrasBody"),
  addWithExtras: document.querySelector("#addWithExtras"),
  toast: document.querySelector("#toast"),
};

bindEvents();
renderOrder();
init();

async function init() {
  try {
    showLoading();
    const data = await loadCatalogData();
    state.categories = data.categories.filter((category) =>
      data.products.some((product) => product.category_id === category.id)
    );
    state.products = data.products.map((product) => ({
      ...product,
      extras: Array.isArray(product.extras) ? product.extras : [],
      numericPrice: moneyToNumber(product.price),
    }));

    readHash();
    state.ready = true;
    renderCategories();
    renderMenuList();
    renderPage();
    if (location.hash === "#menu") openMenuPanel();
  } catch (error) {
    console.error(error);
    showLoadError();
  }
}

async function loadCatalogData() {
  if (window.OSCAR_MENU_CATALOG) {
    return window.OSCAR_MENU_CATALOG;
  }

  const response = await fetch("oscar_menu_catalog.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load catalog: ${response.status}`);
  }
  return response.json();
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    if (state.ready) renderPage();
  });

  els.menuButton.addEventListener("click", openMenuPanel);
  els.closeMenu.addEventListener("click", closeMenuPanel);
  els.closeMenuScrim.addEventListener("click", closeMenuPanel);
  els.backButton.addEventListener("click", () => moveCategory(-1));
  els.nextButton.addEventListener("click", () => moveCategory(1));
  els.openOrder.addEventListener("click", openOrderPanel);
  els.closeOrder.addEventListener("click", closeOrderPanel);
  els.closeOrderScrim.addEventListener("click", closeOrderPanel);

  els.clearOrder.addEventListener("click", () => {
    state.order = [];
    saveOrder();
    renderOrder();
    showToast("Καθαρίστηκε");
  });

  els.copyOrder.addEventListener("click", copyOrderText);

  els.addWithExtras.addEventListener("click", (event) => {
    event.preventDefault();
    addSelectedProductWithExtras();
  });

  window.addEventListener("hashchange", () => {
    if (!state.ready) return;
    if (location.hash === "#menu") {
      openMenuPanel();
      return;
    }
    readHash();
    renderPage();
    renderCategories();
    renderMenuList();
  });

  window.addEventListener("keydown", (event) => {
    if (!state.ready) return;
    if (event.key === "ArrowLeft") moveCategory(-1);
    if (event.key === "ArrowRight") moveCategory(1);
    if (event.key === "Escape") {
      closeMenuPanel();
      closeOrderPanel();
    }
  });
}

function showLoading() {
  els.categoryCounter.textContent = "Φόρτωση καταλόγου";
  els.categoryTitle.textContent = "Oscar";
  els.productCount.textContent = "";
  els.productGrid.innerHTML = `<div class="empty">Φορτώνει ο κατάλογος...</div>`;
}

function showLoadError() {
  state.ready = false;
  els.pageMeta.textContent = "Σφάλμα";
  els.pageTitle.textContent = "Oscar";
  els.categoryCounter.textContent = "Δεν φορτώθηκε";
  els.categoryTitle.textContent = "Άνοιξε το αρχείο ξανά";
  els.productCount.textContent = "";
  els.categoryStrip.innerHTML = "";
  els.menuList.innerHTML = "";
  els.productGrid.innerHTML = `
    <div class="empty">
      Δεν μπόρεσα να διαβάσω τα προϊόντα. Άνοιξε το index.html από τον φάκελο oscar_menu_capture ή τρέξε το με http://localhost:8765/.
    </div>
  `;
}

function readHash() {
  const id = location.hash.replace("#cat-", "");
  const index = state.categories.findIndex((category) => category.id === id);
  state.activeCategory = index >= 0 ? index : 0;
}

function selectCategory(index, shouldCloseMenu = false) {
  if (!state.ready || !state.categories[index]) return;
  state.activeCategory = index;
  const nextHash = `#cat-${state.categories[index].id}`;
  if (location.hash !== nextHash) {
    location.hash = nextHash;
  }
  renderCategories();
  renderMenuList();
  renderPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (shouldCloseMenu) closeMenuPanel();
}

function moveCategory(step) {
  if (!state.ready || state.categories.length === 0) return;
  const total = state.categories.length;
  selectCategory((state.activeCategory + step + total) % total);
}

function renderCategories() {
  els.categoryStrip.innerHTML = "";
  state.categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-tab${index === state.activeCategory ? " active" : ""}`;
    button.textContent = category.name;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(index === state.activeCategory));
    button.addEventListener("click", () => {
      selectCategory(index);
      button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    els.categoryStrip.appendChild(button);
  });
}

function renderMenuList() {
  els.menuList.innerHTML = "";
  state.categories.forEach((category, index) => {
    const count = state.products.filter((product) => product.category_id === category.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `menu-list-button${index === state.activeCategory ? " active" : ""}`;
    button.innerHTML = `
      <span>${escapeHtml(category.name)}</span>
      <strong>${count}</strong>
    `;
    button.addEventListener("click", () => selectCategory(index, true));
    els.menuList.appendChild(button);
  });
}

function renderPage() {
  const category = state.categories[state.activeCategory];
  if (!category) return;

  const products = state.products.filter((product) => {
    const inCategory = product.category_id === category.id;
    const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return inCategory && (!state.search || haystack.includes(state.search));
  });

  els.pageMeta.textContent = `${state.activeCategory + 1} / ${state.categories.length}`;
  els.pageTitle.textContent = category.name;
  els.categoryCounter.textContent = "Σελίδα καταλόγου";
  els.categoryTitle.textContent = category.name;
  els.productCount.textContent = `${products.length} είδη`;
  els.productGrid.innerHTML = "";

  if (products.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Δεν βρέθηκε κάτι εδώ";
    els.productGrid.appendChild(empty);
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${Math.min(index * 35, 350)}ms`;
    card.innerHTML = `
      <div>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        ${product.description ? `<p class="product-desc">${escapeHtml(product.description)}</p>` : ""}
        ${product.extras.length ? `<span class="extras-hint">${product.extras.length} επιλογές</span>` : ""}
      </div>
      <div class="product-bottom">
        <div class="price">${formatMoney(product.numericPrice)}</div>
        <button class="quick-add" type="button" aria-label="Προσθήκη ${escapeHtml(product.name)}">
          <span aria-hidden="true">+</span>
          <strong>${product.extras.length ? "Διάλεξε" : "Προσθήκη"}</strong>
        </button>
      </div>
    `;
    card.querySelector(".quick-add").addEventListener("click", () => handleAdd(product));
    els.productGrid.appendChild(card);
  });
}

function handleAdd(product) {
  if (product.extras.length) {
    openExtras(product);
    return;
  }
  addOrderItem(product, []);
}

function openExtras(product) {
  state.selectedProduct = product;
  els.extrasCategory.textContent = product.category;
  els.extrasTitle.textContent = product.name;
  els.extrasBody.innerHTML = "";

  groupExtras(product.extras).forEach((group) => {
    const section = document.createElement("section");
    section.className = "extra-group";
    const inputType = group.selection === "single" ? "radio" : "checkbox";
    const inputName = `extra-group-${product.product_id}-${group.key}`;
    section.innerHTML = `
      <div class="extra-group-head">
        <h3>${escapeHtml(group.name)}</h3>
        <span>${group.selection === "single" ? "1 επιλογή" : "πολλαπλές"}</span>
      </div>
    `;
    if (group.selection === "single" && !group.required) {
      const none = document.createElement("label");
      none.className = "extra-option extra-none";
      none.innerHTML = `
        <input type="radio" name="${inputName}" value="" checked>
        <span>Χωρίς επιλογή</span>
        <strong></strong>
      `;
      section.appendChild(none);
    }
    group.items.forEach((extra) => {
      const id = `extra-${product.product_id}-${extra.id}`;
      const row = document.createElement("label");
      row.className = "extra-option";
      row.innerHTML = `
        <input id="${id}" type="${inputType}" name="${inputName}" value="${extra.id}" data-extra-id="${extra.id}">
        <span>${escapeHtml(extra.name)}</span>
        <strong>${formatExtraPrice(extra.price)}</strong>
      `;
      section.appendChild(row);
    });
    els.extrasBody.appendChild(section);
  });

  els.extrasDialog.showModal();
}

function addSelectedProductWithExtras() {
  const product = state.selectedProduct;
  if (!product) return;
  const chosenIds = [...els.extrasBody.querySelectorAll("input[data-extra-id]:checked")].map((input) => input.value);
  const chosenExtras = product.extras.filter((extra) => chosenIds.includes(String(extra.id)));
  addOrderItem(product, chosenExtras);
  els.extrasDialog.close();
}

function addOrderItem(product, extras) {
  const extraTotal = extras.reduce((sum, extra) => sum + moneyToNumber(extra.price), 0);
  const key = `${product.product_id}:${extras.map((extra) => extra.id).sort().join(",")}`;
  const existing = state.order.find((item) => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    state.order.push({
      key,
      productId: product.product_id,
      name: product.name,
      category: product.category,
      price: product.numericPrice,
      extraTotal,
      extras: extras.map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: moneyToNumber(extra.price),
      })),
      qty: 1,
    });
  }

  saveOrder();
  renderOrder();
  showToast("Μπήκε στην παραγγελία");
}

function renderOrder() {
  els.orderItems.innerHTML = "";
  if (state.order.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Η παραγγελία είναι άδεια";
    els.orderItems.appendChild(empty);
  }

  state.order.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-row";
    const itemTotal = (item.price + item.extraTotal) * item.qty;
    row.innerHTML = `
      <div>
        <h3>${escapeHtml(item.name)} · ${formatMoney(itemTotal)}</h3>
        <p>${escapeHtml(item.category)}${extrasText(item.extras)}</p>
      </div>
      <div class="qty-controls">
        <button type="button" aria-label="Αφαίρεση">−</button>
        <span>${item.qty}</span>
        <button type="button" aria-label="Προσθήκη">+</button>
      </div>
    `;
    const [minus, plus] = row.querySelectorAll("button");
    minus.addEventListener("click", () => changeQty(item.key, -1));
    plus.addEventListener("click", () => changeQty(item.key, 1));
    els.orderItems.appendChild(row);
  });

  const total = state.order.reduce((sum, item) => sum + (item.price + item.extraTotal) * item.qty, 0);
  els.orderTotal.textContent = formatMoney(total);
  els.orderTotalTop.textContent = formatMoney(total);
}

function changeQty(key, step) {
  const item = state.order.find((entry) => entry.key === key);
  if (!item) return;
  item.qty += step;
  if (item.qty <= 0) {
    state.order = state.order.filter((entry) => entry.key !== key);
  }
  saveOrder();
  renderOrder();
}

function openMenuPanel() {
  els.menuPanel.classList.add("open");
  els.menuPanel.setAttribute("aria-hidden", "false");
}

function closeMenuPanel() {
  els.menuPanel.classList.remove("open");
  els.menuPanel.setAttribute("aria-hidden", "true");
}

function openOrderPanel() {
  els.orderPanel.classList.add("open");
  els.orderPanel.setAttribute("aria-hidden", "false");
}

function closeOrderPanel() {
  els.orderPanel.classList.remove("open");
  els.orderPanel.setAttribute("aria-hidden", "true");
}

async function copyOrderText() {
  const total = state.order.reduce((sum, item) => sum + (item.price + item.extraTotal) * item.qty, 0);
  const lines = state.order.map((item) => {
    const extras = item.extras.length ? ` (${item.extras.map((extra) => extra.name).join(", ")})` : "";
    const itemTotal = (item.price + item.extraTotal) * item.qty;
    return `${item.qty} x ${item.name}${extras} - ${formatMoney(itemTotal)}`;
  });
  const text = [`Oscar παραγγελία`, ...lines, `Σύνολο: ${formatMoney(total)}`].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    showToast("Αντιγράφηκε");
  } catch {
    showToast("Δεν έγινε αντιγραφή");
  }
}

function groupExtras(extras) {
  const map = new Map();
  extras.forEach((extra) => {
    const split = splitExtraGroup(extra);
    const name = split.name;
    const order = split.order;
    const key = `${order}-${name}`;
    if (!map.has(key)) {
      map.set(key, {
        key: slugify(key),
        name,
        order,
        required: Boolean(extra.required),
        selection: getSelectionMode(name, extra),
        items: [],
      });
    }
    map.get(key).items.push(extra);
  });
  return [...map.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "el"));
}

function splitExtraGroup(extra) {
  const originalName = extra.group_name || "Extra";
  const originalOrder = Number(extra.group_order || 999);
  const normalizedGroup = normalizeText(originalName);
  const extraName = normalizeText(extra.name);

  if (normalizedGroup === "επιλεξε ζαχαρη") {
    const sweetenerOptions = new Set(["ζαχαρη λευκη", "ζαχαρη καστανη", "ζαχαρινη", "stevia", "μελι"]);
    if (sweetenerOptions.has(extraName)) {
      return { name: "Τύπος γλυκαντικού", order: originalOrder };
    }
    return { name: "Πόσο γλυκό", order: originalOrder + 0.1 };
  }

  if (normalizedGroup === "με") {
    const meatOptions = new Set(["χοιρινο", "κοτοπουλο"]);
    const sideOptions = new Set(["πατατες", "πατατες special", "ριζοτο λαχανικων"]);
    const servingOptions = new Set(["κυπελλακι", "χωνακι"]);
    if (meatOptions.has(extraName)) {
      return { name: "Επιλογή κρέατος", order: originalOrder };
    }
    if (sideOptions.has(extraName)) {
      return { name: "Συνοδευτικό", order: originalOrder + 0.1 };
    }
    if (servingOptions.has(extraName)) {
      return { name: "Σερβίρισμα", order: originalOrder };
    }
  }

  if (normalizedGroup === "extra") {
    const iceOptions = new Set(["χωρις παγο", "λιγος παγος", "extra παγος"]);
    const temperatureOptions = new Set(["ζεστο/η", "κρυο/α"]);
    const carbonationOptions = new Set(["με ανθρακικο", "χωρις ανθρακικο"]);
    const burgerSizeOptions = new Set(["single", "double"]);
    const drinkMixOptions = new Set([
      "coca cola",
      "coca cola zero",
      "λεμοναδα",
      "νερο",
      "pink grapefruit",
      "σκετο\\η",
      "σοδα",
      "στημενο λεμονι",
      "τιποτα απο τα παραπανω",
    ]);

    if (iceOptions.has(extraName)) {
      return { name: "Πάγος", order: originalOrder - 0.3 };
    }
    if (temperatureOptions.has(extraName)) {
      return { name: "Θερμοκρασία", order: originalOrder - 0.2 };
    }
    if (carbonationOptions.has(extraName)) {
      return { name: "Ανθρακικό", order: originalOrder - 0.1 };
    }
    if (burgerSizeOptions.has(extraName) || isSizeExtra(extraName)) {
      return { name: "Μέγεθος", order: originalOrder - 0.4 };
    }
    if (drinkMixOptions.has(extraName)) {
      return { name: "Συνοδευτικό ποτού", order: originalOrder - 0.2 };
    }
  }

  return { name: originalName, order: originalOrder };
}

function getSelectionMode(groupName, extra) {
  const singleGroups = new Set([
    "γευση",
    "ανθρακικο",
    "θερμοκρασια",
    "επιλεξε μεγεθος",
    "επιλογη κρεατος",
    "με",
    "μεγεθος",
    "παγος",
    "ποσο γλυκο",
    "σερβιρισμα",
    "συνοδευτικο",
    "συνοδευτικο ποτου",
    "τυπος γλυκαντικου",
  ]);
  const name = normalizeText(groupName);
  if (singleGroups.has(name)) return "single";
  if (extra.multiple === 0 && name !== "extra") return "single";
  return "multiple";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9α-ω]+/g, "-");
}

function isSizeExtra(extraName) {
  return (
    extraName.startsWith("mini ") ||
    extraName.startsWith("κανονικη ") ||
    extraName.startsWith("κανονικος ") ||
    extraName.startsWith("γιγας ") ||
    extraName.includes(" κανονικη") ||
    extraName.includes(" κανονικος") ||
    extraName.includes(" γιγας") ||
    extraName.includes(" γιγας.")
  );
}

function extrasText(extras) {
  if (!extras.length) return "";
  return ` · ${extras.map((extra) => extra.name).join(", ")}`;
}

function moneyToNumber(value) {
  const number = Number(String(value || "0").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);
}

function formatExtraPrice(value) {
  const number = moneyToNumber(value);
  if (number === 0) return "";
  return number > 0 ? `+${formatMoney(number)}` : formatMoney(number);
}

function loadOrder() {
  try {
    return JSON.parse(localStorage.getItem("oscarOrder") || "[]");
  } catch {
    return [];
  }
}

function saveOrder() {
  localStorage.setItem("oscarOrder", JSON.stringify(state.order));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("show");
  window.requestAnimationFrame(() => els.toast.classList.add("show"));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
