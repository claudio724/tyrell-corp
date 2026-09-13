const SUPABASE_URL = "https://jhftgebpynvtekrgftnr.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Mhe8vut0WBV2n2gedN57Q_kWn8TOvS";

let allData = [];
let currentFilter = "all";
let currentSort = { col: "date", dir: "desc" };
let searchQuery = "";

/* ── HTML ESCAPING ──
         I record di `acquisitions` arrivano da un form a scrittura pubblica:
         ogni valore va trattato come ostile prima di finire in innerHTML. */
function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

/* ── FETCH ── */
async function fetchData() {
  document.getElementById("table-body").innerHTML =
    '<tr><td colspan="6" class="table-message">Loading acquisitions...</td></tr>';

  try {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const accessToken = sessionData.session.access_token;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/acquisitions?order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    allData = await res.json();
    renderAll();
    document.getElementById("last-updated").textContent =
      "Last updated: " + new Date().toLocaleString("it-IT");
  } catch (err) {
    document.getElementById("table-body").innerHTML =
      '<tr><td colspan="6" class="table-message" style="color:var(--red)">Error: unable to connect to database</td></tr>';
  }
}

/* ── STATS ── */
function renderStats() {
  const total = allData.length;
  document.getElementById("stat-total").textContent = total;

  // Count per unit
  const counts = {};
  allData.forEach((r) => {
    const unit = r.unit_requested || "Unspecified";
    counts[unit] = (counts[unit] || 0) + 1;
  });

  const grid = document.getElementById("stats-grid");
  // Remove old unit cards
  Array.from(grid.querySelectorAll(".stat-card:not(:first-child)")).forEach(
    (el) => el.remove(),
  );

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([unit, count]) => {
      const card = document.createElement("div");
      card.className = "stat-card";
      card.dataset.filter = unit;
      const shortUnit = unit.replace("NX-", "").split("—")[0].trim();
      card.innerHTML = `
        <span class="stat-number">${count}</span>
        <span class="stat-label">${esc(shortUnit)}</span>
        <span class="stat-unit">requests</span>
      `;
      card.addEventListener("click", () => setFilter(unit, card));
      grid.appendChild(card);
    });

  // Re-attach all filter
  grid
    .querySelector('[data-filter="all"]')
    .addEventListener("click", function () {
      setFilter("all", this);
    });
}

/* ── FILTER BUTTONS ── */
function renderFilterButtons() {
  const units = [
    ...new Set(allData.map((r) => r.unit_requested).filter(Boolean)),
  ];
  const container = document.getElementById("unit-filters");
  container.innerHTML = "";
  units.forEach((unit) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.filter = unit;
    btn.textContent = unit.replace("NX-", "").split("—")[0].trim();
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setFilter(unit, null);
    });
    container.appendChild(btn);
  });
}

function setFilter(filter, cardEl) {
  currentFilter = filter;
  // Update stat cards
  document
    .querySelectorAll(".stat-card")
    .forEach((c) => c.classList.remove("active"));
  if (cardEl) cardEl.classList.add("active");
  // Update filter buttons
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle(
      "active",
      b.dataset.filter === filter ||
        (filter === "all" && b.dataset.filter === "all"),
    );
  });
  renderTable();
}

/* ── TABLE ── */
function getFiltered() {
  let data = [...allData];

  if (currentFilter !== "all") {
    data = data.filter((r) => r.unit_requested === currentFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(
      (r) =>
        (r.first_name + " " + r.last_name).toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q),
    );
  }

  data.sort((a, b) => {
    let va, vb;
    if (currentSort.col === "name") {
      va = (a.first_name + a.last_name).toLowerCase();
      vb = (b.first_name + b.last_name).toLowerCase();
    } else if (currentSort.col === "email") {
      va = (a.email || "").toLowerCase();
      vb = (b.email || "").toLowerCase();
    } else if (currentSort.col === "unit") {
      va = (a.unit_requested || "").toLowerCase();
      vb = (b.unit_requested || "").toLowerCase();
    } else {
      va = a.created_at || "";
      vb = b.created_at || "";
    }
    if (va < vb) return currentSort.dir === "asc" ? -1 : 1;
    if (va > vb) return currentSort.dir === "asc" ? 1 : -1;
    return 0;
  });

  return data;
}

function renderTable() {
  const data = getFiltered();
  const tbody = document.getElementById("table-body");
  document.getElementById("row-count").textContent =
    `${data.length} record${data.length !== 1 ? "s" : ""}`;

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="table-message">No records found</td></tr>';
    return;
  }

  tbody.innerHTML = data
    .map((r) => {
      const date = r.created_at
        ? new Date(r.created_at).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";
      const shortId = r.id ? r.id.split("-")[0].toUpperCase() : "—";
      return `
        <tr>
          <td class="td-name">${esc(r.first_name)} ${esc(r.last_name)}</td>
          <td class="td-email">${esc(r.email) || "—"}</td>
          <td class="td-unit">${esc(r.unit_requested) || "—"}</td>
          <td><div class="td-context" title="${esc(r.deployment_context)}">${esc(r.deployment_context) || "—"}</div></td>
          <td class="td-date">${date}</td>
          <td class="td-id">${esc(shortId)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderAll() {
  renderStats();
  renderFilterButtons();
  renderTable();
}

/* ── SORT ── */
document.querySelectorAll("th[data-col]").forEach((th) => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;
    if (currentSort.col === col) {
      currentSort.dir = currentSort.dir === "asc" ? "desc" : "asc";
    } else {
      currentSort.col = col;
      currentSort.dir = "asc";
    }
    document.querySelectorAll("th").forEach((t) => {
      t.classList.remove("sorted");
      const arrow = t.querySelector(".sort-arrow");
      if (arrow) arrow.textContent = "";
    });
    th.classList.add("sorted");
    const arrow = th.querySelector(".sort-arrow");
    if (arrow) arrow.textContent = currentSort.dir === "asc" ? "↑" : "↓";
    renderTable();
  });
});

/* ── SEARCH ── */
document.getElementById("search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  renderTable();
});

/* ── REFRESH ── */
document.getElementById("refresh-btn").addEventListener("click", fetchData);

/* ── SUPABASE AUTH CLIENT ── */
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── AUTH GUARD ── */
async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

/* ── LOGOUT ── */
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

/* ── INIT ── */
document.getElementById("logout-btn").addEventListener("click", logout);
(async () => {
  const authed = await checkAuth();
  if (authed) fetchData();
})();
