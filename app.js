/* TimeArena demo – App Core */

const $ = (id) => document.getElementById(id);

let state = {
  role: null,
  minutes: 0,
  playMode: false,
  history: []
};

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initNav();
  renderAll();
  registerSW();
});

/* ---------------- LOGIN ---------------- */
function initLogin() {
  const btnChild = $("btnChild");
  const btnParent = $("btnParent");
  const pinWrap = $("pinWrap");
  const pinInput = $("pinInput");
  const pinOk = $("pinOk");
  const pinCancel = $("pinCancel");

  btnChild.onclick = () => {
    state.role = "Copil";
    closeLogin();
    renderAll();
  };

  btnParent.onclick = () => {
    pinWrap.classList.remove("hidden");
    pinInput.focus();
  };

  pinCancel.onclick = () => {
    pinWrap.classList.add("hidden");
    pinInput.value = "";
  };

  pinOk.onclick = () => {
    if (pinInput.value !== "1234") {
      alert("PIN greșit");
      return;
    }
    state.role = "Părinte";
    closeLogin();
    renderAll();
  };

  openLogin();
}

function openLogin() {
  $("loginOverlay").classList.remove("hidden");
}

function closeLogin() {
  $("loginOverlay").classList.add("hidden");
}

/* ---------------- NAV ---------------- */
function initNav() {
  document.querySelectorAll(".nav button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      $(btn.dataset.view).classList.add("active");
    };
  });
}

/* ---------------- RENDER ---------------- */
function renderAll() {
  $("minutes").textContent = state.minutes;
  $("roleLabel").textContent = state.role || "—";
  $("playModeLabel").textContent = state.playMode ? "ON" : "OFF";

  renderMissions();
  renderPenalties();
}

function renderMissions() {
  const list = $("missionList");
  list.innerHTML = "";

  window.MISSIONS.winners.forEach(m => {
    const div = document.createElement("div");
    div.textContent = `${m.title} (+${m.points})`;
    div.onclick = () => {
      state.minutes += m.points;
      state.history.push(m.title);
      renderAll();
    };
    list.appendChild(div);
  });
}

function renderPenalties() {
  const list = $("penaltyList");
  list.innerHTML = "";

  window.MISSIONS.penalties.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.title} (-${p.damage})`;
    div.onclick = () => {
      if (state.role !== "Părinte") return alert("Doar părintele");
      state.minutes = Math.max(0, state.minutes - p.damage);
      state.history.push(p.title);
      renderAll();
    };
    list.appendChild(div);
  });
}

/* ---------------- PDF ---------------- */
$("exportPdf").onclick = () => {
  alert("PDF – în versiunea următoare");
};

/* ---------------- SW ---------------- */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
