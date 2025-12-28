// js/order-success.js
import { formatPriceUSD } from "./modules/format.js";

const cartBadge = document.querySelector("[data-cart-badge]");
const orderIdEl = document.querySelector("[data-order-id]");
const totalEl = document.querySelector("[data-order-total]");
const emailEl = document.querySelector("[data-order-email]");
const lineEl = document.querySelector("[data-order-line]");

function getCartCount() {
  try {
    const raw = localStorage.getItem("ta_cart_v1");
    const items = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  } catch {
    return 0;
  }
}

function renderBadge() {
  if (!cartBadge) return;
  cartBadge.textContent = String(getCartCount());
}

function init() {
  renderBadge();

  try {
    const raw = localStorage.getItem("ta_last_order_v1");
    const data = raw ? JSON.parse(raw) : null;

    if (!data) return;

    if (orderIdEl) orderIdEl.textContent = data.orderId || "—";
    if (totalEl) totalEl.textContent = formatPriceUSD(data?.totals?.total ?? 0);
    if (emailEl) emailEl.textContent = data?.customer?.email ?? "—";

    if (lineEl) {
      const name = `${data?.customer?.firstName ?? ""} ${data?.customer?.lastName ?? ""}`.trim();
      lineEl.textContent = name ? `Thanks, ${name}. Your order has been confirmed.` : "Your order has been confirmed.";
    }
  } catch {
    // no-op
  }
}

init();
