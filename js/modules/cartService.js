// js/modules/cartService.js
import { safeReadJSON, safeWriteJSON } from "./storage.js";

export const CART_KEY = "ta_cart_v1";

/**
 * Cart item shape:
 * { id: string, qty: number }
 */

function normalizeCart(cart) {
  if (!Array.isArray(cart)) return [];
  return cart
    .map((x) => ({
      id: String(x?.id ?? ""),
      qty: Number.isFinite(Number(x?.qty)) ? Math.floor(Number(x.qty)) : 0,
    }))
    .filter((x) => x.id && x.qty > 0);
}

export function getCart() {
  return normalizeCart(safeReadJSON(CART_KEY, []));
}

export function setCart(nextCart) {
  return safeWriteJSON(CART_KEY, normalizeCart(nextCart));
}

export function clearCart() {
  try {
    localStorage.removeItem(CART_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getCartCount(cart = getCart()) {
  return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

export function addItem(id, qty = 1) {
  const cleanId = String(id || "");
  const q = Math.floor(Number(qty));
  if (!cleanId || !Number.isFinite(q) || q <= 0) return false;

  const cart = getCart();
  const idx = cart.findIndex((x) => x.id === cleanId);

  if (idx >= 0) cart[idx].qty += q;
  else cart.push({ id: cleanId, qty: q });

  const ok = setCart(cart);
  if (ok) emitCartUpdated();
  return ok;
}

export function setQty(id, qty) {
  const cleanId = String(id || "");
  const q = Math.floor(Number(qty));
  if (!cleanId || !Number.isFinite(q)) return false;

  const cart = getCart();
  const idx = cart.findIndex((x) => x.id === cleanId);
  if (idx < 0) return false;

  if (q <= 0) cart.splice(idx, 1);
  else cart[idx].qty = q;

  const ok = setCart(cart);
  if (ok) emitCartUpdated();
  return ok;
}

export function removeItem(id) {
  const cleanId = String(id || "");
  if (!cleanId) return false;

  const cart = getCart().filter((x) => x.id !== cleanId);
  const ok = setCart(cart);
  if (ok) emitCartUpdated();
  return ok;
}

/**
 * Cross-page sync
 */
export function emitCartUpdated() {
  window.dispatchEvent(new CustomEvent("ta:cart-updated"));
}
