const WEBREST_ORDER_URL = "https://webrest.gr/qr_login.php?account=2";

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
if (menuWaitBtn) {
  if (menuWaitBtn instanceof HTMLAnchorElement) {
    menuWaitBtn.href = WEBREST_ORDER_URL;
  } else {
    menuWaitBtn.addEventListener("click", () => {
      window.location.href = WEBREST_ORDER_URL;
    });
  }
}
