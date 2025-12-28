// js/product.js
import { PRODUCTS } from "./data/products.js";
import { formatPriceUSD, formatRating } from "./modules/format.js";

const cartBadge = document.querySelector("[data-cart-badge]");

const productSection = document.querySelector("[data-product]");
const notFoundSection = document.querySelector("[data-not-found]");

const nameEl = document.querySelector("[data-name]");
const categoryEl = document.querySelector("[data-category]");
const priceEl = document.querySelector("[data-price]");
const ratingEl = document.querySelector("[data-rating]");
const descEl = document.querySelector("[data-description]");

const qtyInput = document.querySelector("[data-qty-input]");
const qtyMinus = document.querySelector("[data-qty-minus]");
const qtyPlus = document.querySelector("[data-qty-plus]");
const addBtn = document.querySelector("[data-add-to-cart]");

const thumbs = Array.from(document.querySelectorAll("[data-thumb]"));
const heroMedia = document.querySelector(".hero-media");

function getCartCount() {
  try {
    const raw = localStorage.getItem("ta_cart_v1");
    if (!raw) return 0;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  } catch {
    return 0;
  }
}

function renderCartBadge() {
  if (!cartBadge) return;
  cartBadge.textContent = String(getCartCount());
}

function getProductIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function clampQty(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function addToCart(productId, qty) {
  try {
    const raw = localStorage.getItem("ta_cart_v1");
    const cart = raw ? JSON.parse(raw) : [];

    const idx = cart.findIndex((i) => i.id === productId);
    if (idx >= 0) cart[idx].qty = (Number(cart[idx].qty) || 0) + qty;
    else cart.push({ id: productId, qty });

    localStorage.setItem("ta_cart_v1", JSON.stringify(cart));
    renderCartBadge();
  } catch {}
}

function setHeroVariant(index) {
  if (!heroMedia) return;

  const variants = [
    `radial-gradient(80% 60% at 50% 35%, rgba(11,15,20,0.12), transparent 60%),
     linear-gradient(180deg, rgba(11,15,20,0.06), rgba(11,15,20,0.02))`,
    `radial-gradient(80% 60% at 30% 35%, rgba(11,15,20,0.12), transparent 60%),
     linear-gradient(180deg, rgba(11,15,20,0.05), rgba(11,15,20,0.02))`,
    `radial-gradient(80% 60% at 70% 35%, rgba(11,15,20,0.12), transparent 60%),
     linear-gradient(180deg, rgba(11,15,20,0.05), rgba(11,15,20,0.02))`
  ];

  heroMedia.style.background = variants[index] || variants[0];

  thumbs.forEach((t) => t.classList.remove("is-active"));
  const active = thumbs.find((t) => Number(t.dataset.thumb) === index);
  if (active) active.classList.add("is-active");
}

function showProduct(product) {
  if (productSection) productSection.hidden = false;
  if (notFoundSection) notFoundSection.hidden = true;

  document.title = `${product.name} — Tech Accessories`;

  if (nameEl) nameEl.textContent = product.name;
  if (categoryEl) categoryEl.textContent = product.category;
  if (priceEl) priceEl.textContent = formatPriceUSD(product.price);
  if (ratingEl) ratingEl.textContent = formatRating(product.rating);
  if (descEl) descEl.textContent = `Designed for modern setups. Clean lines, durable build, and effortless daily use.`;

  setHeroVariant(0);

  if (qtyInput) qtyInput.value = "1";

  thumbs.forEach((t) => {
    t.addEventListener("click", () => {
      const idx = Number(t.dataset.thumb);
      setHeroVariant(Number.isFinite(idx) ? idx : 0);
    });
  });
  

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener("click", () => {
      qtyInput.value = String(clampQty(Number(qtyInput.value) - 1));
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener("click", () => {
      qtyInput.value = String(clampQty(Number(qtyInput.value) + 1));
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener("input", () => {
      qtyInput.value = String(clampQty(qtyInput.value));
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const qty = clampQty(qtyInput?.value ?? 1);
      addToCart(product.id, qty);
    });
  }
}

function showNotFound() {
  if (productSection) productSection.hidden = true;
  if (notFoundSection) notFoundSection.hidden = false;
  document.title = "Product not found — Tech Accessories";
}

function init() {
  renderCartBadge();

  const id = getProductIdFromUrl();
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) return showNotFound();
  showProduct(product);
}

init();
