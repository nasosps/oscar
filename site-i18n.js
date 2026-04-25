(function () {
  const storageKey = "oscarLang";

  const languages = {
    el: { flag: "🇬🇷", label: "Ελληνικά", html: "el" },
    en: { flag: "🇬🇧", label: "English", html: "en" },
  };

  const ui = {
    el: {
      pageTitle: "Oscar Coffee & Food | Μενού & Online Παραγγελία",
      metaDescription:
        "Oscar Coffee & Food, Κάτω Ασίτες 700 13. Πλήρες μενού και online παραγγελία, τηλέφωνα, χάρτης και Instagram.",
      languageSwitcherLabel: "Αλλαγή γλώσσας",
      headline: "Oscar Coffee & Food",
      location: "Κάτω Ασίτες 700 13",
      table: "Τραπέζι:",
      menuButtonTitle: "Δες το μενού",
      menuButtonSubtitle: "Πλήρες μενού & online παραγγελία",
      menuButtonPill: "Παραγγελία",
      phones: "Τηλέφωνα",
      call: "Κλήση",
      landline: "Σταθερό",
      quickActions: "Γρήγορες ενέργειες",
      directions: "Μετάβαση",
      reviewUs: "Αξιολογήστε μας",
      link: "Link",
      saveContact: "Αποθήκευση Επαφής",
      vcard: "Λήψη κάρτας vCard (.vcf)",
      open: "Άνοιγμα",
      storeInfo: "Πληροφορίες Καταστήματος",
      hours: "Ωράριο",
      delivery: "Παράδοση",
      kitchen: "Κουζίνα",
      dailyHours: "Ισχύει καθημερινά, Δευτέρα έως Κυριακή.",
      address: "Διεύθυνση",
      openMap: "Πήγαινε με εκεί",
      travelTime: "Ενδεικτικός χρόνος μετάβασης: 1 ώ. 1 λ.",
    },
    en: {
      pageTitle: "Oscar Coffee & Food | Menu & Online Ordering",
      metaDescription:
        "Oscar Coffee & Food, Kato Asites 700 13. Full menu and online ordering, phones, map and Instagram.",
      languageSwitcherLabel: "Change language",
      headline: "Oscar Coffee & Food",
      location: "Kato Asites 700 13",
      table: "Table:",
      menuButtonTitle: "View Menu",
      menuButtonSubtitle: "Full menu & online ordering",
      menuButtonPill: "Order",
      phones: "Phones",
      call: "Call",
      landline: "Landline",
      quickActions: "Quick actions",
      directions: "Directions",
      reviewUs: "Review us",
      link: "Link",
      saveContact: "Save contact",
      vcard: "Download vCard (.vcf)",
      open: "Open",
      storeInfo: "Store information",
      hours: "Opening hours",
      delivery: "Delivery",
      kitchen: "Kitchen",
      dailyHours: "Open daily, Monday to Sunday.",
      address: "Address",
      openMap: "Take me there",
      travelTime: "Estimated travel time: 1 h 1 min.",
    },
  };

  function hasLanguage(lang) {
    return Object.prototype.hasOwnProperty.call(languages, lang);
  }

  function getStoredLang() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(storageKey, lang);
    } catch {
      // Ignore storage errors in private browsing modes.
    }
  }

  function currentLang() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (hasLanguage(fromUrl)) return fromUrl;

    const stored = getStoredLang();
    if (hasLanguage(stored)) return stored;

    return "el";
  }

  function t(key, lang = currentLang()) {
    return ui[lang]?.[key] || ui.el[key] || key;
  }

  function renderSwitchers(active = currentLang()) {
    document.querySelectorAll("[data-language-switcher]").forEach((switcher) => {
      switcher.setAttribute("aria-label", t("languageSwitcherLabel", active));
      switcher.innerHTML = Object.entries(languages)
        .map(([lang, info]) => {
          const selected = lang === active;
          return `
            <button
              type="button"
              class="lang-button${selected ? " is-active" : ""}"
              data-lang="${lang}"
              aria-label="${info.label}"
              aria-pressed="${selected ? "true" : "false"}"
              title="${info.label}"
            >
              <span class="lang-flag" aria-hidden="true">${info.flag}</span>
              <span>${lang.toUpperCase()}</span>
            </button>
          `;
        })
        .join("");
    });
  }

  function applyStatic(lang = currentLang()) {
    document.documentElement.lang = languages[lang].html;
    document.title = t("pageTitle", lang);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("metaDescription", lang));
    }

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n, lang);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder, lang));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel, lang));
    });
  }

  function setLang(lang) {
    if (!hasLanguage(lang)) return;
    setStoredLang(lang);
    applyStatic(lang);
    renderSwitchers(lang);
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("[data-lang]");
    if (!button) return;
    setLang(button.dataset.lang);
  });

  document.addEventListener("DOMContentLoaded", () => {
    setLang(currentLang());
  });

  window.OSCAR_I18N = {
    languages,
    currentLang,
    setLang,
    t,
  };
})();
