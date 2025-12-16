/* TimeArena demo – App Core (NO ROLES) */

const $ = (id) => document.getElementById(id);

let state = {
  minutes: 0,
  playMode: false,
  history: []
};

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initControls();
  renderAll();
  registerSW();
});

/* NAVIGATION */
function initNav() {
  document.querySelectorAll(".nav button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      $(btn.dataset.view).classList.add("active");
    };
  });
}

/* CONTROLS */
function initControls() {
  $("togglePlayMode").onclick = () => {
    state.playMode = !state.playMode;
    addHistory(`Play Mode ${state.playMode ? "ON" : "OFF"}`);
    renderAll();
  };

  $("exportPdf").onclick = () => {
    alert("Export PDF – pasul următor");
  };
}

/* RENDER */
function renderAll() {
  $("minutes").textContent = state.minutes;
  $("level").textContent = Math.floor(state.minutes / 100) + 1;
  $("motivation").textContent = Math.min(100, 60 + state.minutes / 10) + "%";
  $("playModeLabel").textContent = state.playMode ? "ON" : "OFF";

  renderMissions();
  renderPenalties();
  renderHistory();
}

/* MISSIONS */
function renderMissions() {
  const list = $("missionList");
  list.innerHTML = "";

  window.MISSIONS.winners.forEach(m => {
    const div = document.createElement("div");
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

/* PENALTIES */
function renderPenalties() {
  const list = $("penaltyList");
  list.innerHTML = "";

  window.MISSIONS.penalties.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.title} (-${p.damage} min)`;
    div.onclick = () => {
      state.minutes = Math.max(0, state.minutes - p.damage);
      addHistory(p.title);
      renderAll();
    };
    list.appendChild(div);
  });
}

/* HISTORY */
function renderHistory() {
  const list = $("historyList");
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

/* SERVICE WORKER */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
