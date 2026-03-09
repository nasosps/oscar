const params = new URLSearchParams(window.location.search);
const table = params.get("table") || params.get("t");

if (table) {
  const pill = document.getElementById("table-pill");
  const num = document.getElementById("table-number");
  if (pill && num) {
    num.textContent = table;
    pill.hidden = false;
  }
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const menuWaitBtn = document.getElementById("menu-wait-btn");
const menuWaitTitle = document.getElementById("menu-wait-title");
const menuWaitSubtitle = document.getElementById("menu-wait-subtitle");
const menuWaitPill = document.getElementById("menu-wait-pill");
if (menuWaitBtn) {
  let menuWaitTimer = null;
  const defaultTitle = menuWaitTitle?.textContent || "Δες το Menu";
  const defaultSubtitle = menuWaitSubtitle?.textContent || "Πλήρης προβολή καταλόγου";
  const defaultPill = menuWaitPill?.textContent || "Menu";

  menuWaitBtn.addEventListener("click", () => {
    if (menuWaitTitle) {
      menuWaitTitle.textContent = "Αναμένουμε σύνδεση";
    }
    if (menuWaitSubtitle) {
      menuWaitSubtitle.textContent = "με πλατφόρμα menu.";
    }
    if (menuWaitPill) {
      menuWaitPill.textContent = "Soon";
    }

    if (menuWaitTimer) {
      clearTimeout(menuWaitTimer);
    }
    menuWaitTimer = setTimeout(() => {
      if (menuWaitTitle) {
        menuWaitTitle.textContent = defaultTitle;
      }
      if (menuWaitSubtitle) {
        menuWaitSubtitle.textContent = defaultSubtitle;
      }
      if (menuWaitPill) {
        menuWaitPill.textContent = defaultPill;
      }
    }, 3500);
  });
}

const menuSection = document.getElementById("menu");
const menuIsVisible = !(menuSection && menuSection.hidden);

const menuData = Array.isArray(window.OSCAR_MENU) ? window.OSCAR_MENU : [];
const menuSearchEl = document.getElementById("menu-search");
const menuClearEl = document.getElementById("menu-clear");
const menuChipsEl = document.getElementById("menu-chips");
const menuResultsEl = document.getElementById("menu-results");

if (menuIsVisible && menuData.length && menuSearchEl && menuClearEl && menuChipsEl && menuResultsEl) {
  const categories = menuData.map((section) => section.category);
  let activeCategory = "Όλα";
  let query = "";

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const normalizeText = (value) =>
    String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const greekToLatinMap = {
    α: "a",
    β: "v",
    γ: "g",
    δ: "d",
    ε: "e",
    ζ: "z",
    η: "i",
    θ: "th",
    ι: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "x",
    ο: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    ς: "s",
    τ: "t",
    υ: "y",
    φ: "f",
    χ: "ch",
    ψ: "ps",
    ω: "o",
  };

  const toGreeklish = (value) =>
    normalizeText(value)
      .split("")
      .map((char) => greekToLatinMap[char] ?? char)
      .join("");

  const renderChips = () => {
    const all = ["Όλα", ...categories];
    menuChipsEl.innerHTML = all
      .map((category) => {
        const isActive = category === activeCategory;
        return `<button type="button" class="menu-chip${isActive ? " is-active" : ""}" data-category="${escapeHtml(
          category
        )}" role="tab" aria-selected="${isActive ? "true" : "false"}">${escapeHtml(category)}</button>`;
      })
      .join("");
  };

  const itemMatches = (item, category) => {
    const byCategory = activeCategory === "Όλα" || category === activeCategory;
    if (!byCategory) return false;
    if (!query) return true;

    const haystack = normalizeText(
      `${item.name} ${item.price ?? ""} ${category} ${(item.tags || []).join(" ")}`
    );
    const normalizedQuery = normalizeText(query);
    if (haystack.includes(normalizedQuery)) return true;
    return toGreeklish(haystack).includes(toGreeklish(normalizedQuery));
  };

  const renderResults = () => {
    const sections = [];

    for (const section of menuData) {
      const visibleItems = section.items.filter((item) => itemMatches(item, section.category));
      if (visibleItems.length === 0) continue;

      const itemsHtml = visibleItems
        .map((item) => {
          const tags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags.join(" • ") : "";
          return `
            <article class="menu-item">
              <div class="menu-item-main">
                <strong class="menu-item-title">${escapeHtml(item.name)}</strong>
                ${tags ? `<div class="menu-item-tags">${escapeHtml(tags)}</div>` : ""}
              </div>
              <span class="menu-price">${escapeHtml(item.price || "")}</span>
            </article>
          `;
        })
        .join("");

      sections.push(`
        <section class="menu-category">
          <h3>${escapeHtml(section.category)}</h3>
          <div class="menu-items">${itemsHtml}</div>
        </section>
      `);
    }

    if (sections.length === 0) {
      menuResultsEl.innerHTML = `<div class="menu-empty">Δεν βρέθηκαν προϊόντα για την αναζήτηση "${escapeHtml(
        query
      )}".</div>`;
      return;
    }

    menuResultsEl.innerHTML = sections.join("");
  };

  menuSearchEl.addEventListener("input", () => {
    query = menuSearchEl.value.trim();
    renderResults();
  });

  menuClearEl.addEventListener("click", () => {
    query = "";
    activeCategory = "Όλα";
    menuSearchEl.value = "";
    renderChips();
    renderResults();
    menuSearchEl.focus();
  });

  menuChipsEl.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const chip = target.closest(".menu-chip");
    if (!chip) return;
    activeCategory = chip.dataset.category || "Όλα";
    renderChips();
    renderResults();
  });

  renderChips();
  renderResults();
}

const menuViewer = document.getElementById("menu-viewer");
if (menuIsVisible && menuViewer) {
  const imageEl = document.getElementById("menu-image");
  const counterEl = document.getElementById("menu-counter");
  const openFullEl = document.getElementById("menu-open-full");
  const prevBtn = document.getElementById("menu-prev");
  const nextBtn = document.getElementById("menu-next");
  const hitLeft = document.getElementById("menu-hit-left");
  const hitRight = document.getElementById("menu-hit-right");
  const stage = document.getElementById("menu-stage");

  let pages = [];
  try {
    const rawPages = menuViewer.getAttribute("data-pages");
    const parsed = rawPages ? JSON.parse(rawPages) : [];
    if (Array.isArray(parsed)) {
      pages = parsed.filter((p) => typeof p === "string" && p.trim().length > 0);
    }
  } catch {
    pages = [];
  }

  if (pages.length === 0) {
    pages = ["assets/menu.jpg"];
  }

  let currentPage = 0;
  let touchStartX = null;

  const preloadAround = () => {
    const prev = pages[currentPage - 1];
    const next = pages[currentPage + 1];
    if (prev) {
      const img = new Image();
      img.src = prev;
    }
    if (next) {
      const img = new Image();
      img.src = next;
    }
  };

  const updateMenuView = () => {
    if (!pages.length || !imageEl) return;
    const currentSrc = pages[currentPage];
    imageEl.src = currentSrc;
    imageEl.alt = `Menu σελίδα ${currentPage + 1}`;

    if (counterEl) {
      counterEl.textContent = `${currentPage + 1} / ${pages.length}`;
    }
    if (openFullEl) {
      openFullEl.href = currentSrc;
    }
    if (prevBtn) {
      prevBtn.disabled = currentPage === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage === pages.length - 1;
    }

    preloadAround();
  };

  const goToPage = (index) => {
    if (!pages.length) return;
    currentPage = Math.max(0, Math.min(pages.length - 1, index));
    updateMenuView();
  };

  const goNext = () => goToPage(currentPage + 1);
  const goPrev = () => goToPage(currentPage - 1);

  prevBtn?.addEventListener("click", goPrev);
  nextBtn?.addEventListener("click", goNext);
  hitLeft?.addEventListener("click", goPrev);
  hitRight?.addEventListener("click", goNext);

  stage?.addEventListener(
    "touchstart",
    (ev) => {
      touchStartX = ev.changedTouches[0]?.clientX ?? null;
    },
    { passive: true }
  );

  stage?.addEventListener(
    "touchend",
    (ev) => {
      if (touchStartX === null) return;
      const touchEndX = ev.changedTouches[0]?.clientX ?? touchStartX;
      const dx = touchEndX - touchStartX;
      if (Math.abs(dx) > 35) {
        if (dx < 0) {
          goNext();
        } else {
          goPrev();
        }
      }
      touchStartX = null;
    },
    { passive: true }
  );

  if (pages.length <= 1) {
    prevBtn?.setAttribute("hidden", "hidden");
    nextBtn?.setAttribute("hidden", "hidden");
    hitLeft?.setAttribute("hidden", "hidden");
    hitRight?.setAttribute("hidden", "hidden");
  }

  updateMenuView();
}
