// js/products.js
import { PRODUCTS } from "./data/products.js";
import { addItem } from "./modules/cartService.js";
import { mountCartBadge, toast } from "./modules/ui.js";
import { formatUSD } from "./modules/money.js";

const grid = document.querySelector("[data-products-grid]");
const emptyState = document.querySelector("[data-empty]");
const searchInput = document.querySelector("[data-search]");
const sortSelect = document.querySelector("[data-sort]");

let currentSearch = "";
let currentSort = "featured";

function toDateValue(iso) {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function applySearch(items) {
  const q = currentSearch.trim().toLowerCase();
  if (!q) return items;
  return items.filter((p) => (`${p.name} ${p.category}`).toLowerCase().includes(q));
}

function applySort(items) {
  const copy = [...items];
  switch (currentSort) {
    case "price-asc":
      copy.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      copy.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      copy.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      copy.sort((a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt));
      break;
    default:
      break;
  }
  return copy;
}

function productCardHTML(p) {
  const detailsHref = `./product.html?id=${encodeURIComponent(p.id)}`;

  return `
    <article class="product-card" data-open data-href="${detailsHref}" tabindex="0" role="link" aria-label="Open ${p.name}">
      <div class="product-media" aria-hidden="true"></div>

      <div class="product-body">
        <h3 class="product-title">${p.name}</h3>

        <div class="product-meta">
          <p class="product-price">${formatUSD(p.price)}</p>
          <p class="product-rating">★ ${p.rating.toFixed(1)}</p>
        </div>

        <div class="product-actions">
          <a class="btn btn-sm btn-outline" href="${detailsHref}" data-no-open>Details</a>
          <button class="btn btn-sm btn-solid" type="button" data-add data-id="${p.id}" data-no-open>Add</button>
        </div>
      </div>
    </article>
  `;
}

function render(items) {
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  grid.innerHTML = items.map(productCardHTML).join("");
}

function update() {
  const searched = applySearch(PRODUCTS);
  const sorted = applySort(searched);
  render(sorted);
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value || "";
    update();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value || "featured";
    update();
  });
}

document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = addBtn.getAttribute("data-id");
    if (id) {
      addItem(id, 1);
      toast("Added to cart");
    }
    return;
  }

  if (e.target.closest("[data-no-open]")) return;

  const card = e.target.closest("[data-open]");
  if (!card) return;

  const href = card.getAttribute("data-href");
  if (!href) return;

  window.location.assign(href);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const active = document.activeElement;
  const card = active?.closest?.("[data-open]");
  if (!card) return;
  const href = card.getAttribute("data-href");
  if (href) window.location.assign(href);
});

mountCartBadge();
update();
