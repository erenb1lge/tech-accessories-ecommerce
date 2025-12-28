// js/cart.js
import { PRODUCTS } from "./data/products.js";
import { getCart, setQty, removeItem, clearCart } from "./modules/cartService.js";
import { mountCartBadge, toast } from "./modules/ui.js";
import { formatUSD } from "./modules/money.js";

const listEl = document.querySelector("[data-cart-list]");
const emptyEl = document.querySelector("[data-cart-empty]");

const subtotalEl = document.querySelector("[data-subtotal]");
const shippingEl = document.querySelector("[data-shipping]");
const taxEl = document.querySelector("[data-tax]");
const totalEl = document.querySelector("[data-total]");

const checkoutLink = document.querySelector("[data-checkout-link]");
const clearBtn = document.querySelector("[data-clear-cart]");

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

function renderTotals(items) {
  const { subtotal, shipping, tax, total } = computeTotals(items);

  if (subtotalEl) subtotalEl.textContent = formatUSD(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 && subtotal > 0 ? "Free" : formatUSD(shipping);
  if (taxEl) taxEl.textContent = formatUSD(tax);
  if (totalEl) totalEl.textContent = formatUSD(total);

  const hasItems = items.length > 0;

  if (checkoutLink) {
    checkoutLink.setAttribute("aria-disabled", String(!hasItems));
    checkoutLink.classList.toggle("is-disabled", !hasItems);
  }

  if (clearBtn) clearBtn.disabled = !hasItems;
}

function rowHTML(it) {
  return `
    <article class="cart-row" data-row data-id="${it.id}">
      <div class="cart-media" aria-hidden="true"></div>

      <div class="cart-info">
        <h3>${it.name}</h3>
        <div class="cart-meta">
          <span>${it.category}</span>
          <span>${formatUSD(it.price)} each</span>
        </div>
      </div>

      <div class="cart-controls">
        <div class="cart-line">${formatUSD(it.line)}</div>

        <div class="qty" aria-label="Quantity selector">
          <button class="qty-btn" type="button" data-qty-minus aria-label="Decrease quantity">−</button>
          <input class="qty-input" type="number" min="1" value="${it.qty}" data-qty-input aria-label="Quantity" />
          <button class="qty-btn" type="button" data-qty-plus aria-label="Increase quantity">+</button>
        </div>

        <button class="remove" type="button" data-remove>Remove</button>
      </div>
    </article>
  `;
}

function render(items) {
  if (!listEl) return;

  const hasItems = items.length > 0;
  listEl.innerHTML = hasItems ? items.map(rowHTML).join("") : "";
  if (emptyEl) emptyEl.hidden = hasItems;

  renderTotals(items);
}

function syncUI() {
  const cart = getCart();
  const items = enrichCart(cart);
  render(items);
}

document.addEventListener("click", (e) => {
  const row = e.target.closest("[data-row]");
  if (!row) return;

  const id = row.getAttribute("data-id");
  if (!id) return;

  if (e.target.closest("[data-remove]")) {
    removeItem(id);
    toast("Removed from cart");
    syncUI();
    return;
  }

  if (e.target.closest("[data-qty-minus]") || e.target.closest("[data-qty-plus]")) {
    const input = row.querySelector("[data-qty-input]");
    const now = clampQty(input?.value ?? 1);
    const next = e.target.closest("[data-qty-plus]") ? now + 1 : now - 1;
    setQty(id, next);
    syncUI();
    return;
  }
});

document.addEventListener("input", (e) => {
  const input = e.target.closest("[data-qty-input]");
  if (!input) return;

  const row = e.target.closest("[data-row]");
  const id = row?.getAttribute("data-id");
  if (!id) return;

  setQty(id, input.value);
  syncUI();
});

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    clearCart();
    toast("Cart cleared");
    syncUI();
  });
}

mountCartBadge();
syncUI();

window.addEventListener("ta:cart-updated", () => {
  syncUI();
});
