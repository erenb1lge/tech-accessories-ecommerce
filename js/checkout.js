// js/checkout.js
import { PRODUCTS } from "./data/products.js";
import { getCart, clearCart } from "./modules/cartService.js";
import { mountCartBadge } from "./modules/ui.js";
import { formatUSD } from "./modules/money.js";

const form = document.querySelector("[data-checkout-form]");
const emptySection = document.querySelector("[data-empty]");
const miniList = document.querySelector("[data-mini-list]");

const subtotalEl = document.querySelector("[data-subtotal]");
const shippingEl = document.querySelector("[data-shipping]");
const taxEl = document.querySelector("[data-tax]");
const totalEl = document.querySelector("[data-total]");

function clampQty(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function enrichCart(cart) {
  return cart
    .map((ci) => {
      const p = PRODUCTS.find((x) => x.id === ci.id);
      if (!p) return null;

      const qty = clampQty(ci.qty);
      const line = p.price * qty;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        qty,
        line,
      };
    })
    .filter(Boolean);
}

function computeTotals(items) {
  const subtotal = items.reduce((sum, it) => sum + it.line, 0);
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 8) : 0;
  const tax = subtotal > 0 ? Math.round(subtotal * 0.08) : 0;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

function renderSummary(items) {
  if (miniList) {
    miniList.innerHTML = items
      .map(
        (it) => `
      <div class="mini-row">
        <div class="mini-left">
          <p class="mini-name">${it.name}</p>
          <p class="mini-meta">${it.category} • Qty ${it.qty}</p>
        </div>
        <div class="mini-right">${formatUSD(it.line)}</div>
      </div>
    `
      )
      .join("");
  }

  const { subtotal, shipping, tax, total } = computeTotals(items);

  if (subtotalEl) subtotalEl.textContent = formatUSD(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 && subtotal > 0 ? "Free" : formatUSD(shipping);
  if (taxEl) taxEl.textContent = formatUSD(tax);
  if (totalEl) totalEl.textContent = formatUSD(total);
}

function setError(name, message) {
  const el = document.querySelector(`[data-error-for="${name}"]`);
  if (el) el.textContent = message || "";
}

function validate(values) {
  const keys = [
    "firstName","lastName","email","phone","address","city","postal","country",
    "cardNumber","cardExpiry","cardCvc","cardName"
  ];
  keys.forEach((k) => setError(k, ""));

  let ok = true;

  for (const key of keys) {
    if (!values[key] || String(values[key]).trim().length === 0) {
      setError(key, "This field is required.");
      ok = false;
    }
  }

  const email = String(values.email || "");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    setError("email", "Enter a valid email address.");
    ok = false;
  }

  const expiry = String(values.cardExpiry || "");
  if (expiry && !/^\d{2}\/\d{2}$/.test(expiry)) {
    setError("cardExpiry", "Use MM/YY format.");
    ok = false;
  }

  const cvc = String(values.cardCvc || "");
  if (cvc && !/^\d{3,4}$/.test(cvc)) {
    setError("cardCvc", "CVC must be 3–4 digits.");
    ok = false;
  }

  return ok;
}

function init() {
  mountCartBadge();

  const cart = getCart();
  const items = enrichCart(cart);

  if (items.length === 0) {
    const layout = document.querySelector(".co-layout");
    if (layout) layout.hidden = true;
    if (emptySection) emptySection.hidden = false;
    return;
  }

  if (emptySection) emptySection.hidden = true;
  renderSummary(items);

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const values = Object.fromEntries(fd.entries());

    if (!validate(values)) return;

    const orderId = `TA-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    const totals = computeTotals(items);

    localStorage.setItem(
      "ta_last_order_v1",
      JSON.stringify({
        orderId,
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        },
        totals,
        items,
      })
    );

    clearCart();
    window.location.assign("./order-success.html");
  });
}

init();
