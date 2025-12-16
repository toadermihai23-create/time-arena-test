/* ======================================================
   TimeArena demo — App Core (NO ROLES, STABLE NAV)
   ====================================================== */

const $ = (id) => document.getElementById(id);

/* ---------------- STATE ---------------- */
let state = {
  minutes: 0,
  playMode: false,
  history: []
};

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initControls();
  renderAll();
  registerSW();
});

/* ---------------- NAVIGATION ---------------- */
function initNav() {
  const buttons = document.querySelectorAll(".nav button[data-view]");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const viewId = btn.dataset.view;
      if (!viewId) return;

      const target = document.getElementById(viewId);
      if (!target) {
        console.warn("View not found:", viewId);
        return;
      }

      document.querySelectorAll(".view").forEach(v =>
        v.classList.remove("active")
      );

      target.classList.add("active");
    });
  });
}

/* ---------------- CONTROLS ---------------- */
function initControls() {
  const toggleBtn = $("togglePlayMode");
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      state.playMode = !state.playMode;
      addHistory(`Play Mode ${state.playMode ? "ON" : "OFF"}`);
      renderAll();
    };
  }

  const exportBtn = $("exportPdf");
  if (exportBtn) {
    exportBtn.onclick = () => {
      alert("Export PDF – urmează");
    };
  }
}

/* ---------------- RENDER ---------------- */
function renderAll() {
  const minEl = $("minutes");
  const lvlEl = $("level");
  const motEl = $("motivation");
  const playEl = $("playModeLabel");

  if (minEl) minEl.textContent = state.minutes;
  if (lvlEl) lvlEl.textContent = Math.floor(state.minutes / 100) + 1;
  if (motEl) motEl.textContent = Math.min(100, 60 + state.minutes / 10) + "%";
  if (playEl) playEl.textContent = state.playMode ? "ON" : "OFF";

  renderMissions();
  renderPenalties();
  renderHistory();
}

/* ---------------- MISSIONS ---------------- */
function renderMissions() {
  const list = $("missionList");
  if (!list || !window.MISSIONS) return;

  list.innerHTML = "";

  window.MISSIONS.winners.forEach(m => {
    const div = document.createElement("div");
    div.className = "item";
    div.textContent = `${m.title} (+${m.points} min)`;

    div.onclick = () => {
      if (!state.playMode) {
        alert("Play Mode este OFF");
        return;
      }
      state.minutes += m.points;
      addHistory(m.title);
      renderAll();
    };

    list.appendChild(div);
  });
}

/* ---------------- PENALTIES ---------------- */
function renderPenalties() {
  const list = $("penaltyList");
  if (!list || !window.MISSIONS) return;

  list.innerHTML = "";

  window.MISSIONS.penalties.forEach(p => {
    const div = document.createElement("div");
    div.className = "item danger";
    div.textContent = `${p.title} (-${p.damage} min)`;

    div.onclick = () => {
      state.minutes = Math.max(0, state.minutes - p.damage);
      addHistory(p.title);
      renderAll();
    };

    list.appendChild(div);
  });
}

/* ---------------- HISTORY ---------------- */
function renderHistory() {
  const list = $("historyList");
  if (!list) return;

  list.innerHTML = "";
  state.history.slice(-10).reverse().forEach(h => {
    const div = document.createElement("div");
    div.textContent = h;
    list.appendChild(div);
  });
}

function addHistory(text) {
  state.history.push(`${new Date().toLocaleTimeString()} – ${text}`);
}

/* ---------------- SERVICE WORKER ---------------- */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
