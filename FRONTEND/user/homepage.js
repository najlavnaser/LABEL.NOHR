/* =========================================================
   nohr. landing page
   ---------------------------------------------------------
   IMAGES: drop your originals into an /images folder using
   these names (or edit the paths below):
     images/hero.jpg
     images/kurtas.jpg, dresses.jpg, sarees.jpg
     images/product-1.jpg ... product-4.jpg
   If a file is missing, a generated placeholder is shown
   automatically, so the layout always looks complete.
   ========================================================= */

const PRODUCTS = [
  { name: "Striped Kurta Set", price: 1500, rating: 4.8, img: "images/product-1.jpg", tone: "#3f6aa3" },
  { name: "Yellow Silk Saree", price: 3650, rating: 5.0, img: "images/product-2.jpg", tone: "#d6b25e" },
  { name: "Linen Floral Dress", price: 1550, rating: 4.9, img: "images/product-3.jpg", tone: "#e7dfd0" },
  { name: "Summer Dress", price: 1250, rating: 4.2, img: "images/product-4.jpg", tone: "#9ec7b4" },
];

/* ---------- Placeholder (alternative) images ---------- */
const FALLBACK_STYLES = {
  hero:    { a: "#1f2d22", b: "#55634f", label: "Hero image", w: 1400, h: 700 },
  kurtas:  { a: "#e9e6da", b: "#cfc8b4", label: "Kurtas",     w: 400,  h: 400 },
  dresses: { a: "#d9d1c8", b: "#a99d90", label: "Dresses",    w: 400,  h: 400 },
  sarees:  { a: "#f3e4b5", b: "#d6b25e", label: "Sarees",     w: 400,  h: 400 },
  product: { a: "#eeeeee", b: "#d4d4d4", label: "Product",    w: 400,  h: 460 },
};

function placeholderSVG(key, labelOverride, tone) {
  const s = FALLBACK_STYLES[key] || FALLBACK_STYLES.product;
  const a = tone ? tone : s.a;
  const b = tone ? "#00000033" : s.b;
  const label = labelOverride || s.label;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3">
      <circle cx="${s.w / 2}" cy="${s.h * 0.34}" r="${Math.min(s.w, s.h) * 0.09}"/>
      <path d="M${s.w * 0.30} ${s.h * 0.78} Q${s.w / 2} ${s.h * 0.40} ${s.w * 0.70} ${s.h * 0.78}"/>
    </g>
    <text x="50%" y="${s.h * 0.92}" text-anchor="middle" font-family="Manrope, Arial, sans-serif"
          font-size="${Math.max(14, s.w * 0.04)}" fill="rgba(255,255,255,.85)" letter-spacing="2">
      ${label.toUpperCase()}
    </text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
}

function applyFallback(img) {
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "true";
  const key = img.dataset.fallback || "product";
  img.src = placeholderSVG(key, img.dataset.label, img.dataset.tone);
}

function watchImages(root = document) {
  root.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => applyFallback(img));
    // handles images that already failed before the listener attached
    if (img.complete && img.naturalWidth === 0) applyFallback(img);
  });
}

/* ---------- Products ---------- */
function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <article class="product-card">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" data-fallback="product" data-label="${p.name}" data-tone="${p.tone}" loading="lazy" />
        <button class="wish" aria-label="Add ${p.name} to wishlist" data-index="${i}">
          <svg viewBox="0 0 24 24"><path d="M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 11-8 11z"/></svg>
        </button>
        <button class="add-cart" data-index="${i}">ADD TO CART</button>
      </div>
      <div class="product-info">
        <span class="product-name">${p.name}</span>
        <span class="product-price">Rs.${p.price.toLocaleString("en-IN")}</span>
      </div>
      <div class="rating"><span class="stars">${starString(p.rating)}</span> (${p.rating.toFixed(1)})</div>
    </article>
  `).join("");
  watchImages(grid);
}

/* ---------- Cart / wishlist ---------- */
let cartItems = 0;
function bindProductActions() {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("cartCount");

  grid.addEventListener("click", (e) => {
    const wish = e.target.closest(".wish");
    const add = e.target.closest(".add-cart");
    if (wish) wish.classList.toggle("active");
    if (add) {
      cartItems += 1;
      countEl.textContent = cartItems;
      countEl.hidden = false;
      add.textContent = "ADDED ✓";
      setTimeout(() => (add.textContent = "ADD TO CART"), 1200);
    }
  });
}

/* ---------- Header behaviour ---------- */
function initHeader() {
  const header = document.getElementById("header");
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  const dropdown = document.querySelector(".dropdown");
  const dropBtn = document.querySelector(".dropdown-toggle");
  const searchBtn = document.getElementById("searchBtn");
  const searchBar = document.getElementById("searchBar");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  dropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("open");
    dropBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
      dropBtn.setAttribute("aria-expanded", "false");
    }
  });

  searchBtn.addEventListener("click", () => {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) searchBar.querySelector("input").focus();
  });

  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}


function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  const input = document.getElementById("emailInput");
  const msg = document.getElementById("formMsg");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!emailRe.test(value)) {
      msg.textContent = "Please enter a valid email address.";
      msg.classList.add("error");
      input.focus();
      return;
    }
    msg.classList.remove("error");
    msg.textContent = "Thank you! Your 10% code is on its way.";
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderProducts();
  watchImages();
  bindProductActions();
  initHeader();
  initNewsletter();
});



// Handle profile icon click
const accountBtn = document.getElementById("accountBtn");

if (accountBtn) {
    accountBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(
                "/api/user/check-auth",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (response.ok) {
                window.location.href = "/profile";
            } else {
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Login check failed:", error);
            window.location.href = "/login";
        }
    });
}