const baseUrlInput = document.getElementById("base-url");
const startInput = document.getElementById("start-table");
const endInput = document.getElementById("end-table");
const grid = document.getElementById("qr-grid");
const generateBtn = document.getElementById("generate-btn");
const printBtn = document.getElementById("print-btn");

function normalizeBaseUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  try {
    const u = new URL(trimmed);
    return `${u.origin}${u.pathname}`.replace(/\/+$/, "/");
  } catch {
    return "";
  }
}

function buildQrUrl(target) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(target)}`;
}

function renderQrs() {
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);
  const start = Number(startInput.value);
  const end = Number(endInput.value);

  grid.innerHTML = "";

  if (!baseUrl || Number.isNaN(start) || Number.isNaN(end) || start < 1 || end < start) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Συμπλήρωσε σωστά τα πεδία (URL και εύρος τραπεζιών).";
    grid.appendChild(p);
    return;
  }

  for (let table = start; table <= end; table += 1) {
    const target = `${baseUrl}?table=${table}`;
    const card = document.createElement("article");
    card.className = "qr-item";

    const img = document.createElement("img");
    img.src = buildQrUrl(target);
    img.alt = `QR Table ${table}`;
    img.loading = "lazy";

    const title = document.createElement("p");
    title.textContent = `Τραπέζι ${table}`;

    const link = document.createElement("a");
    link.href = target;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Άνοιγμα link";
    link.style.fontSize = "0.78rem";
    link.style.display = "inline-block";
    link.style.marginTop = "6px";
    link.style.color = "inherit";

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(link);
    grid.appendChild(card);
  }
}

generateBtn.addEventListener("click", renderQrs);
printBtn.addEventListener("click", () => window.print());

if (!baseUrlInput.value) {
  baseUrlInput.value = `${window.location.origin}${window.location.pathname.replace(/qr\.html$/, "")}`;
}

renderQrs();
