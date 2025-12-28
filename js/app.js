// app.js (global entry)
// - Cart badge
// - Mobile nav toggle
// - Home hero crossfade (supports 2 or 3 images)

const CART_KEY = "ta_cart_v1";

function safeParseJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getCartCount() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return 0;
  const items = safeParseJSON(raw, []);
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0);
}

function renderCartBadge() {
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;
  badge.textContent = String(getCartCount());
}

renderCartBadge();

/* ---------------------------
   Mobile menu (hamburger)
--------------------------- */
(function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-mobile-nav]");
  if (!toggle || !panel) return;

  // Create overlay once (if not exists)
  let overlay = document.querySelector(".nav-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);
  }

  function open() {
    panel.classList.add("is-open");
    overlay.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function close() {
    panel.classList.remove("is-open");
    overlay.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function isOpen() {
    return panel.classList.contains("is-open");
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen() ? close() : open();
  });

  overlay.addEventListener("click", close);

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) close();
  });

  // Close on navigation click
  panel.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });
})();

/* ---------------------------
   Home hero crossfade
--------------------------- */
(function initHeroCrossfade() {
  const stage = document.querySelector("[data-hero-stage]");
  if (!stage) return;

  const imgs = Array.from(stage.querySelectorAll("img"));
  if (imgs.length === 0) return;

  imgs.forEach((img) => img.classList.remove("is-visible"));

  const hasHeadphones3 = imgs.some((i) =>
    (i.getAttribute("src") || "").includes("headphones3.png")
  );

  if (!hasHeadphones3) {
    const front = stage.querySelector("[data-hero-front]");
    if (front) {
      const src = front.getAttribute("src") || "";
      if (src.includes("headphones2.png")) {
        const img3 = document.createElement("img");
        img3.src = src.replace("headphones2.png", "headphones3.png");
        img3.alt = front.alt || "Aura Headphones";
        img3.loading = "eager";
        stage.appendChild(img3);
        imgs.push(img3);
      }
    }
  }

  let index = 0;
  imgs.forEach((img, i) => img.classList.toggle("is-visible", i === index));

  const HOLD_MS = 2200;
  const FADE_MS = 900;

  imgs.forEach((img) => {
    const preload = new Image();
    preload.src = img.src;
  });

  setInterval(() => {
    const next = (index + 1) % imgs.length;
    imgs[next].classList.add("is-visible");
    setTimeout(() => {
      imgs[index].classList.remove("is-visible");
      index = next;
    }, FADE_MS);
  }, HOLD_MS);
})();

// Disable click on featured cards (visual only section)
document.querySelectorAll(".featured-card").forEach(card => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
  });
});
