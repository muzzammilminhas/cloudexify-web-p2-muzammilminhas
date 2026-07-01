const els = {
  productGrid: document.getElementById("productGrid"),
  resultCount: document.getElementById("resultCount"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  priceFilter: document.getElementById("priceFilter"),
  stockFilter: document.getElementById("stockFilter"),
  sortFilter: document.getElementById("sortFilter"),
  priceRange: document.getElementById("priceRange"),
  priceLabel: document.getElementById("priceLabel"),
  categoryList: document.getElementById("categoryList"),
  cartBadge: document.getElementById("cartBadge"),
  cartTitleCount: document.getElementById("cartTitleCount"),
  cartItems: document.getElementById("cartItems"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  cartShipping: document.getElementById("cartShipping"),
  cartDiscount: document.getElementById("cartDiscount"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutItems: document.getElementById("checkoutItems"),
  checkoutSubtotal: document.getElementById("checkoutSubtotal"),
  checkoutDiscount: document.getElementById("checkoutDiscount"),
  checkoutTotal: document.getElementById("checkoutTotal"),
  checkoutForm: document.getElementById("checkoutForm"),
  orderSuccess: document.getElementById("orderSuccess"),
  discountCode: document.getElementById("discountCode"),
  applyDiscount: document.getElementById("applyDiscount"),
  themeToggle: document.getElementById("themeToggle"),
  bootLoader: document.getElementById("bootLoader"),
  resetFilters: document.getElementById("resetFilters"),
  clearCart: document.getElementById("clearCart"),
  toastBody: document.getElementById("toastBody"),
  newsletterForm: document.getElementById("newsletterForm"),
  newsletterMessage: document.getElementById("newsletterMessage")
};

const storageKeys = {
  cart: "deskdrop-cart",
  wishlist: "deskdrop-wishlist",
  discount: "deskdrop-discount",
  theme: "deskdrop-theme",
  countdown: "deskdrop-countdown-target",
  countdownVersion: "deskdrop-countdown-version"
};

const countdownVersion = "30-day-drop";

const currency = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0
});

let cart = readStorage(storageKeys.cart, []);
let wishlist = readStorage(storageKeys.wishlist, []);
let discount = readStorage(storageKeys.discount, null);
let activeModalProductId = null;

const cartToast = new bootstrap.Toast(document.getElementById("cartToast"), { delay: 1800 });
const productModal = new bootstrap.Modal(document.getElementById("productModal"));

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return currency.format(value).replace("PKR", "Rs").trim();
}

function getCartQty(productId) {
  return cart.find((item) => item.id === productId)?.qty || 0;
}

function getAvailableStock(product) {
  return Math.max(product.stock - getCartQty(product.id), 0);
}

function getCartSummary() {
  const subtotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const shipping = subtotal > 0 ? 650 : 0;
  const discountAmount = discount ? Math.round(subtotal * discount.rate) : 0;
  return {
    subtotal,
    itemCount,
    shipping,
    discountAmount,
    total: Math.max(subtotal + shipping - discountAmount, 0)
  };
}

function buildCategories() {
  const categories = [...new Set(PRODUCTS.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category[0].toUpperCase() + category.slice(1);
    els.categoryFilter.appendChild(option);
  });
  renderCategoryList("all");
}

function renderCategoryList(activeCategory) {
  const categories = ["all", ...new Set(PRODUCTS.map((product) => product.category))];
  els.categoryList.innerHTML = categories.map((category) => {
    const count = category === "all"
      ? PRODUCTS.length
      : PRODUCTS.filter((product) => product.category === category).length;
    const label = category === "all" ? "All products" : category[0].toUpperCase() + category.slice(1);
    return `
      <button class="${activeCategory === category ? "active" : ""}" type="button" data-category-shortcut="${category}">
        <span>${label}</span><strong>${count}</strong>
      </button>`;
  }).join("");
}

function getFilteredProducts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const maxPrice = Math.min(Number(els.priceFilter.value), Number(els.priceRange.value));
  const stockStatus = els.stockFilter.value;

  let list = PRODUCTS.filter((product) => {
    const available = getAvailableStock(product);
    const searchable = `${product.name} ${product.category} ${product.colorway} ${product.description}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesCategory = category === "all" || product.category === category;
    const matchesPrice = product.price <= maxPrice;
    const matchesStock = stockStatus === "all" ||
      (stockStatus === "in" && available > 0) ||
      (stockStatus === "low" && available > 0 && available <= 3);
    return matchesQuery && matchesCategory && matchesPrice && matchesStock;
  });

  if (els.sortFilter.value === "price-asc") {
    list = list.toSorted((a, b) => a.price - b.price);
  } else if (els.sortFilter.value === "price-desc") {
    list = list.toSorted((a, b) => b.price - a.price);
  } else if (els.sortFilter.value === "rating-desc") {
    list = list.toSorted((a, b) => b.rating - a.rating);
  }

  return list;
}

function renderProducts() {
  const products = getFilteredProducts();
  els.resultCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
  els.emptyState.classList.toggle("d-none", products.length > 0);
  renderCategoryList(els.categoryFilter.value);

  els.productGrid.innerHTML = products.map((product, index) => {
    const available = getAvailableStock(product);
    const soldOut = available === 0;
    const lowStock = available > 0 && available <= 3;
    const wished = wishlist.includes(product.id);

    return `
      <article class="col-sm-6 col-xl-4 col-xxl-3 product-reveal" style="--card-delay: ${Math.min(index * 70, 420)}ms">
        <div class="product-card h-100">
          <button class="wish-button ${wished ? "active" : ""}" type="button" data-wishlist="${product.id}" aria-label="${wished ? "Remove from" : "Add to"} wishlist">
            ${wished ? "&#9829;" : "&#9825;"}
          </button>
          <button class="product-media" type="button" data-open-product="${product.id}" aria-label="Open details for ${product.name}">
            <img src="${product.image}" alt="${product.name}">
            <span class="stock-chip ${lowStock ? "low" : ""} ${soldOut ? "sold" : ""}">
              ${soldOut ? "Sold out" : lowStock ? `Only ${available} left` : `${available} left`}
            </span>
          </button>
          <div class="product-copy">
            <div>
              <h3>${product.name}</h3>
              <p>${product.colorway}</p>
            </div>
            <div class="product-meta">
              <span>${formatPrice(product.price)}</span>
              <span>${product.rating.toFixed(1)} &#9733;</span>
            </div>
            <button class="btn btn-outline-info w-100" type="button" data-add="${product.id}" ${soldOut ? "disabled" : ""}>
              ${soldOut ? "Sold out" : "Add to cart"}
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function renderCart() {
  const summary = getCartSummary();
  els.cartBadge.textContent = summary.itemCount;
  els.cartTitleCount.textContent = `(${summary.itemCount})`;
  els.cartEmpty.classList.toggle("d-none", cart.length > 0);

  els.cartItems.innerHTML = cart.map((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    if (!product) return "";
    const available = getAvailableStock(product);
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${product.colorway}</p>
          <div class="qty-control" aria-label="Quantity for ${product.name}">
            <button type="button" data-dec="${product.id}" aria-label="Decrease quantity">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" data-inc="${product.id}" ${available <= 0 ? "disabled" : ""} aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-item-end">
          <button type="button" data-remove="${product.id}" aria-label="Remove ${product.name}">&times;</button>
          <strong>${formatPrice(product.price * item.qty)}</strong>
        </div>
      </article>`;
  }).join("");

  els.cartSubtotal.textContent = formatPrice(summary.subtotal);
  els.cartShipping.textContent = formatPrice(summary.shipping);
  els.cartDiscount.textContent = `-${formatPrice(summary.discountAmount)}`;
  els.cartTotal.textContent = formatPrice(summary.total);
  els.checkoutItems.textContent = String(summary.itemCount);
  els.checkoutSubtotal.textContent = formatPrice(summary.subtotal);
  els.checkoutDiscount.textContent = `-${formatPrice(summary.discountAmount)}`;
  els.checkoutTotal.textContent = formatPrice(summary.total);
}

function sync() {
  writeStorage(storageKeys.cart, cart);
  writeStorage(storageKeys.wishlist, wishlist);
  if (discount) writeStorage(storageKeys.discount, discount);
  else localStorage.removeItem(storageKeys.discount);
  renderProducts();
  renderCart();
}

function addToCart(id) {
  const product = PRODUCTS.find((entry) => entry.id === id);
  if (!product || getAvailableStock(product) <= 0) return;

  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });

  els.toastBody.textContent = `${product.name} added to cart.`;
  cartToast.show();
  sync();
}

function updateQuantity(id, delta) {
  const product = PRODUCTS.find((entry) => entry.id === id);
  const item = cart.find((entry) => entry.id === id);
  if (!product || !item) return;
  if (delta > 0 && getAvailableStock(product) <= 0) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  }
  sync();
}

function openProduct(id) {
  const product = PRODUCTS.find((entry) => entry.id === id);
  if (!product) return;
  const available = getAvailableStock(product);
  activeModalProductId = id;
  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalImage").alt = product.name;
  document.getElementById("modalCategory").textContent = product.category;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalPrice").textContent = formatPrice(product.price);
  document.getElementById("modalRating").textContent = `${product.rating.toFixed(1)} / 5`;
  document.getElementById("modalStock").textContent = available === 0 ? "Sold out" : `${available} left`;
  document.getElementById("modalAdd").disabled = available === 0;
  document.getElementById("modalAdd").textContent = available === 0 ? "Sold out" : "Add to cart";
  productModal.show();
}

function applyDiscountCode() {
  const code = els.discountCode.value.trim().toUpperCase();
  if (!code) {
    discount = null;
    sync();
    return;
  }
  if (code === "CX2026" || code === "DROP10") {
    discount = { code, rate: 0.1 };
    els.toastBody.textContent = `${code} applied: 10% off.`;
  } else {
    discount = null;
    els.toastBody.textContent = "Discount code not valid.";
  }
  cartToast.show();
  sync();
}

function resetFilters() {
  els.searchInput.value = "";
  els.categoryFilter.value = "all";
  els.priceFilter.value = "999999";
  els.stockFilter.value = "all";
  els.sortFilter.value = "featured";
  els.priceRange.value = "32000";
  updatePriceLabel();
  renderProducts();
}

function updatePriceLabel() {
  const value = Number(els.priceRange.value);
  els.priceLabel.textContent = value >= 32000 ? "Any" : formatPrice(value);
}

function startCountdown() {
  let target = localStorage.getItem(storageKeys.countdown);
  const savedVersion = localStorage.getItem(storageKeys.countdownVersion);
  if (!target || savedVersion !== countdownVersion || Number.isNaN(Date.parse(target)) || new Date(target) <= new Date()) {
    target = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(storageKeys.countdown, target);
    localStorage.setItem(storageKeys.countdownVersion, countdownVersion);
  }

  const update = () => {
    const diff = new Date(target) - new Date();
    const remaining = Math.max(diff, 0);
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    document.querySelector('[data-unit="days"]').textContent = String(days).padStart(2, "0");
    document.querySelector('[data-unit="hours"]').textContent = String(hours).padStart(2, "0");
    document.querySelector('[data-unit="minutes"]').textContent = String(minutes).padStart(2, "0");
    document.querySelector('[data-unit="seconds"]').textContent = String(seconds).padStart(2, "0");
  };

  update();
  setInterval(update, 1000);
}

function initTheme() {
  const theme = localStorage.getItem(storageKeys.theme) || "dark";
  document.documentElement.dataset.theme = theme;
}

function initExperience() {
  const finishBoot = () => document.body.classList.add("is-loaded");
  if (document.readyState === "complete") {
    setTimeout(finishBoot, 450);
  } else {
    window.addEventListener("load", () => setTimeout(finishBoot, 450), { once: true });
    setTimeout(finishBoot, 1600);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

  let pointerFrame = 0;
  let pendingPointer = null;
  els.productGrid.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    pendingPointer = {
      card,
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      if (pendingPointer) {
        pendingPointer.card.style.setProperty("--mx", pendingPointer.x.toFixed(3));
        pendingPointer.card.style.setProperty("--my", pendingPointer.y.toFixed(3));
      }
      pendingPointer = null;
      pointerFrame = 0;
    });
  });

  els.productGrid.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".product-card");
    if (card && !card.contains(event.relatedTarget)) {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    }
  });
}

function bindEvents() {
  ["input", "change"].forEach((eventName) => {
    [els.searchInput, els.categoryFilter, els.priceFilter, els.stockFilter, els.sortFilter].forEach((control) => {
      control.addEventListener(eventName, renderProducts);
    });
  });

  els.priceRange.addEventListener("input", () => {
    updatePriceLabel();
    renderProducts();
  });

  els.categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category-shortcut]");
    if (!button) return;
    els.categoryFilter.value = button.dataset.categoryShortcut;
    renderProducts();
  });

  els.productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    const openButton = event.target.closest("[data-open-product]");
    const wishButton = event.target.closest("[data-wishlist]");
    if (addButton) addToCart(Number(addButton.dataset.add));
    if (openButton) openProduct(Number(openButton.dataset.openProduct));
    if (wishButton) {
      const id = Number(wishButton.dataset.wishlist);
      wishlist = wishlist.includes(id) ? wishlist.filter((entry) => entry !== id) : [...wishlist, id];
      sync();
    }
  });

  els.cartItems.addEventListener("click", (event) => {
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    const remove = event.target.closest("[data-remove]");
    if (inc) updateQuantity(Number(inc.dataset.inc), 1);
    if (dec) updateQuantity(Number(dec.dataset.dec), -1);
    if (remove) {
      cart = cart.filter((item) => item.id !== Number(remove.dataset.remove));
      sync();
    }
  });

  els.clearCart.addEventListener("click", () => {
    cart = [];
    sync();
  });

  document.getElementById("modalAdd").addEventListener("click", () => {
    if (activeModalProductId) {
      addToCart(activeModalProductId);
      openProduct(activeModalProductId);
    }
  });

  document.querySelectorAll("#productModal [data-bs-dismiss='modal']").forEach((button) => {
    button.addEventListener("click", () => productModal.hide());
  });

  els.applyDiscount.addEventListener("click", applyDiscountCode);
  els.resetFilters.addEventListener("click", resetFilters);

  els.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(storageKeys.theme, next);
  });

  els.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!els.checkoutForm.checkValidity() || cart.length === 0) {
      els.checkoutForm.classList.add("was-validated");
      els.orderSuccess.classList.remove("d-none");
      els.orderSuccess.textContent = cart.length === 0
        ? "Add at least one product to cart before checkout."
        : "Please complete the highlighted fields.";
      els.orderSuccess.classList.add("error");
      return;
    }

    const orderId = `DD-${Date.now().toString().slice(-6)}`;
    cart = [];
    discount = null;
    els.checkoutForm.reset();
    els.checkoutForm.classList.remove("was-validated");
    els.orderSuccess.className = "form-message success";
    els.orderSuccess.textContent = `Order ${orderId} simulated successfully. Cart cleared.`;
    sync();
  });

  els.newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    els.newsletterMessage.textContent = "Drop alert saved for this session.";
    els.newsletterForm.reset();
  });
}

initTheme();
initExperience();
buildCategories();
updatePriceLabel();
bindEvents();
startCountdown();
sync();
