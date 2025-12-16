/* ======================================================
   TimeArena demo — App Core
   Compatible with existing missions.js (UNCHANGED)
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
  document.querySelectorAll(".nav button[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const viewId = btn.dataset.view;
      const target = document.getElementById(viewId);
      if (!target) return;

      document.querySelectorAll(".view").forEach(v =>
        v.classList.remove("active")
      );
      target.classList.add("active");
    });
  });
}

/* ---------------- CONTROLS ---------------- */
function initControls() {
  const toggle = $("togglePlayMode");
  if (toggle) {
    toggle.onclick = () => {
      state.playMode = !state.playMode;
      addHistory(`Play Mode ${state.playMode ? "ON" : "OFF"}`);
      renderAll();
    };
  }

  const exportBtn = $("exportPdf");
  if (exportBtn) {
    exportBtn.onclick = () => {
      alert("Raport PDF – urmează");
    };
  }
}

/* ---------------- RENDER ALL ---------------- */
function renderAll() {
  updateDashboard();
  renderMissionList("missionList", window.MISSIONS?.winners, onWinnerClick);
  renderMissionList("penaltyList", window.MISSIONS?.penalties, onPenaltyClick);
  renderHistory();
}

/* ---------------- DASHBOARD ---------------- */
function updateDashboard() {
  $("minutes").textContent = state.minutes;
  $("level").textContent = Math.floor(state.minutes / 100) + 1;
  $("motivation").textContent =
    Math.min(100, 60 + state.minutes / 10) + "%";
  $("playModeLabel").textContent = state.playMode ? "ON" : "OFF";
}

/* ---------------- GENERIC MISSION RENDERER ---------------- */
function renderMissionList(containerId, missions, handler) {
  const container = $(containerId);
  if (!container || !Array.isArray(missions)) return;

  container.innerHTML = "";

  missions.forEach(m => {
    const card = document.createElement("div");
    card.className = "mission-card";

    const title = m.title || m.name || "Misiune";
    const value =
      m.points !== undefined ? `+${m.points} min` :
      m.damage !== undefined ? `-${m.damage} min` :
      "";

    card.innerHTML = `
      <span>${title}</span>
      <strong>${value}</strong>
    `;

    card.onclick = () => handler(m);
    container.appendChild(card);
  });
}

/* ---------------- HANDLERS ---------------- */
function onWinnerClick(mission) {
  if (!state.playMode) {
    alert("Play Mode este OFF");
    return;
  }

  const points = Number(mission.points || 0);
  state.minutes += points;
  addHistory(mission.title || "Misiune câștig");
  renderAll();
}

function onPenaltyClick(mission) {
  const damage = Number(mission.damage || 0);
  state.minutes = Math.max(0, state.minutes - damage);
  addHistory(mission.title || "Penalitate");
  renderAll();
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
  state.history.push(
    `${new Date().toLocaleTimeString()} – ${text}`
  );
}

/* ---------------- SERVICE WORKER ---------------- */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
