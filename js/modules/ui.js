// js/modules/ui.js
import { getCartCount, getCart } from "./cartService.js";

export function mountCartBadge(selector = "[data-cart-badge]") {
  const el = document.querySelector(selector);
  if (!el) return;

  const render = () => {
    el.textContent = String(getCartCount(getCart()));
  };

  render();

  window.addEventListener("ta:cart-updated", render);
  window.addEventListener("storage", render); // if user has multiple tabs open
}

export function toast(message, { duration = 2200 } = {}) {
  let host = document.querySelector("[data-toast-host]");
  if (!host) {
    host = document.createElement("div");
    host.setAttribute("data-toast-host", "");
    host.style.position = "fixed";
    host.style.right = "16px";
    host.style.bottom = "16px";
    host.style.zIndex = "9999";
    host.style.display = "grid";
    host.style.gap = "10px";
    document.body.appendChild(host);
  }

  const el = document.createElement("div");
  el.textContent = message;
  el.style.border = "1px solid rgba(17,24,39,.12)";
  el.style.borderRadius = "16px";
  el.style.padding = "12px 14px";
  el.style.background = "rgba(255,255,255,.92)";
  el.style.backdropFilter = "blur(8px)";
  el.style.boxShadow = "0 14px 30px rgba(11,15,20,.12)";
  el.style.fontSize = "14px";
  el.style.letterSpacing = "-0.01em";

  host.appendChild(el);

  const t = setTimeout(() => {
    el.remove();
  }, duration);

  el.addEventListener("click", () => {
    clearTimeout(t);
    el.remove();
  });
}
