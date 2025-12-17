import { loadMissionsLive } from "./missions.js";
import { loadPenaltiesLive } from "./penalties.js";
import { loadRulesLive } from "./rules.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const STORAGE_KEY = "timearena_state_v1";

const defaultState = {
  player: "Nikita",
  playMode: true,

  xp: 0,
  level: 1,
  timeMin: 0,
  streak: 0,

  lastDayKey: null,
  completedToday: {},     // { missionId: count }
  history: []             // { ts, type, title, deltaXp, deltaTime }
};

let state = loadState();
let data = { missions: [], penalties: [], rules: [] };

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch {
    return structuredClone(defaultState);
  }
}

function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

function resetDailyIfNeeded() {
  const dk = dayKey();
  if (state.lastDayKey !== dk) {
    // streak logic: dacă ai avut activitate ieri, păstrezi; altfel reset simplu
    const prev = state.lastDayKey;
    state.lastDayKey = dk;
    state.completedToday = {};
    if (prev) {
      // streak crește doar când faci prima acțiune din ziua nouă
      // (îl incrementăm la prima completare)
    }
    saveState();
  }
}

function addHistory(entry) {
  state.history.unshift(entry);
  state.history = state.history.slice(0, 200);
}

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (t.hidden = true), 1800);
}

function confetti() {
  const c = $("#confetti");
  c.hidden = false;
  clearTimeout(confetti._t);
  confetti._t = setTimeout(() => (c.hidden = true), 550);
}

function xpToNextLevel(level) {
  // simplu, escalare ușoară
  return 120 + (level - 1) * 40;
}

function applyLevelUpIfNeeded() {
  while (state.xp >= xpToNextLevel(state.level)) {
    state.xp -= xpToNextLevel(state.level);
    state.level += 1;
    confetti();
    showToast(`🆙 Level Up! Acum ești Level ${state.level}!`);
  }
}

function updateStatsUI() {
  $("#statPlayer").textContent = state.player;
  $("#statLevel").textContent = String(state.level);
  $("#statXP").textContent = String(state.xp);
  $("#statTime").textContent = `${state.timeMin} min`;
  $("#statStreak").textContent = String(state.streak);

  // motivație simplă: bazată pe streak + timp + level
  const mot = Math.max(10, Math.min(100, 20 + state.streak * 6 + state.level * 3));
  $("#motivationFill").style.width = `${mot}%`;

  $("#btnPlayMode").textContent = state.playMode ? "🎮 Play Mode: ON" : "🛑 Play Mode: OFF";
  $("#btnPlayMode").setAttribute("aria-pressed", state.playMode ? "true" : "false");
}

function setSubtitle(text) {
  $("#subtitle").textContent = text;
}

function bindNav() {
  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;
      $$(".view").forEach(v => v.classList.remove("active"));
      $(`#view-${view}`).classList.add("active");

      renderActiveView(view);
    });
  });
}

function renderDashboard() {
  const v = $("#view-dashboard");
  const last = state.history.slice(0, 6);

  v.innerHTML = `
    <div class="card">
      <h3>🏟️ Panou principal</h3>
      <p>Totul e LIVE din Google Sheets. Tu modifici foaia, jocul se schimbă instant.</p>
      <div class="row">
        <span class="tag good">✅ Misiuni: ${data.missions.length}</span>
        <span class="tag">🛡️ Penalități: ${data.penalties.length}</span>
        <span class="tag">📜 Reguli: ${data.rules.length}</span>
      </div>
      <div class="hr"></div>
      <div class="small">Ultimele acțiuni:</div>
      <div style="margin-top:10px; display:grid; gap:8px;">
        ${last.length ? last.map(h => `
          <div class="card" style="padding:10px; background:rgba(255,255,255,.03)">
            <div style="display:flex; justify-content:space-between; gap:10px;">
              <div style="font-weight:800">${h.title}</div>
              <div class="small">${new Date(h.ts).toLocaleString()}</div>
            </div>
            <div class="small">XP: ${h.deltaXp >= 0 ? "+" : ""}${h.deltaXp} • Timp: ${h.deltaTime >= 0 ? "+" : ""}${h.deltaTime} min</div>
          </div>
        `).join("") : `<div class="small">— încă nu ai acțiuni azi —</div>`}
      </div>
    </div>
  `;
}

function renderMissions() {
  const v = $("#view-missions");

  const categories = Array.from(new Set(data.missions.map(m => m.type))).sort();
  const catOptions = [`<option value="all">Toate tipurile</option>`]
    .concat(categories.map(c => `<option value="${c}">${c}</option>`))
    .join("");

  v.innerHTML = `
    <div class="toolbar">
      <div style="display:flex; gap:10px; align-items:center;">
        <input class="input" id="missionSearch" placeholder="Caută: pat, teme, dinți…" />
        <select id="missionType">${catOptions}</select>
      </div>
      <div class="small">Tip: 🎯 Winner + 🛡️ Loser legate “cap la cap”</div>
    </div>
    <div class="grid" id="missionsGrid"></div>
  `;

  const grid = $("#missionsGrid");
  const search = $("#missionSearch");
  const typeSel = $("#missionType");

  const paint = () => {
    const q = (search.value || "").toLowerCase();
    const t = typeSel.value;

    const list = data.missions.filter(m => {
      const okT = (t === "all") || (m.type === t);
      const okQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.penalty?.name || "").toLowerCase().includes(q);
      return okT && okQ;
    });

    grid.innerHTML = list.map(m => missionCard(m)).join("");

    // bind buttons
    list.forEach(m => {
      const btn = $(`#btn-do-${cssSafe(m.id)}`);
      if (btn) btn.addEventListener("click", () => completeMission(m.id));
      const btnP = $(`#btn-pen-${cssSafe(m.id)}`);
      if (btnP) btnP.addEventListener("click", () => applyPenaltyFromMission(m.id));
    });
  };

  search.addEventListener("input", paint);
  typeSel.addEventListener("change", paint);
  paint();
}

function missionCard(m) {
  const doneCount = state.completedToday[m.id] || 0;
  const canDo = state.playMode;

  const reward = `⏳ +${m.rewardMin} min • ✨ +${m.xp} XP`;
  const pen = m.penalty ? `⛔ ${m.penalty.name} • ${m.penalty.penaltyMin} min • (${m.penalty.type})` : "—";

  return `
    <div class="card">
      <h3>${escapeHtml(m.name)}</h3>
      <p>${escapeHtml(m.description || "")}</p>
      <div class="row">
        <span class="tag good">${escapeHtml(reward)}</span>
        <span class="tag">${escapeHtml(m.type)}</span>
      </div>
      <div class="hr"></div>
      <div class="small"><b>🛡️ Penalitate legată:</b> ${escapeHtml(pen)}</div>
      <div class="row">
        <button class="btn" id="btn-do-${cssSafe(m.id)}" ${canDo ? "" : "disabled"}>✅ Completează</button>
        <button class="btn ghost" id="btn-pen-${cssSafe(m.id)}" ${canDo ? "" : "disabled"}>💥 Aplică penalitate</button>
        <span class="small">Azi: <b>${doneCount}</b></span>
      </div>
    </div>
  `;
}

function completeMission(missionId) {
  resetDailyIfNeeded();

  const m = data.missions.find(x => x.id === missionId);
  if (!m) return;

  // streak: crește la prima acțiune din ziua curentă
  const anyToday = Object.values(state.completedToday).reduce((a,b)=>a+b,0);
  if (anyToday === 0) state.streak += 1;

  state.completedToday[missionId] = (state.completedToday[missionId] || 0) + 1;

  state.xp += m.xp;
  state.timeMin += m.rewardMin;

  addHistory({
    ts: Date.now(),
    type: "mission",
    title: `✅ ${m.name}`,
    deltaXp: m.xp,
    deltaTime: m.rewardMin
  });

  applyLevelUpIfNeeded();
  saveState();
  updateStatsUI();
  confetti();
  showToast(`✅ +${m.rewardMin} min / +${m.xp} XP`);

  renderActiveView("missions");
}

function applyPenaltyFromMission(missionId) {
  resetDailyIfNeeded();

  const m = data.missions.find(x => x.id === missionId);
  if (!m || !m.penalty) return;

  const p = m.penalty;
  state.timeMin = Math.max(0, state.timeMin + p.penaltyMin); // p.penaltyMin e negativ
  addHistory({
    ts: Date.now(),
    type: "penalty",
    title: `💥 ${p.name}`,
    deltaXp: 0,
    deltaTime: p.penaltyMin
  });

  saveState();
  updateStatsUI();
  showToast(`${p.name}: ${p.penaltyMin} min`);

  renderActiveView("history");
}

function renderPenalties() {
  const v = $("#view-penalties");

  v.innerHTML = `
    <div class="card">
      <h3>🛡️ Damage Cards (catalog)</h3>
      <p>Acestea vin din tab-ul <b>_Penalitati</b>. Sunt “reguli de arenă”, nu negocieri.</p>
    </div>

    <div class="grid" style="margin-top:12px;" id="penGrid"></div>
  `;

  const grid = $("#penGrid");
  grid.innerHTML = data.penalties
    .sort((a,b)=>a.level-b.level)
    .map(p => `
      <div class="card">
        <h3>${escapeHtml(`${p.emoji || "🛡️"} ${p.name || "Penalty"}`)}</h3>
        <p>${escapeHtml(p.when || p.description || "")}</p>
        <div class="row">
          <span class="tag bad">Nivel: ${p.level}</span>
          <span class="tag">Durată: ${escapeHtml(p.duration || "—")}</span>
        </div>
        <div class="hr"></div>
        <div class="small"><b>🎮 Efect:</b> ${escapeHtml(p.effect || "—")}</div>
        <div class="small" style="margin-top:6px;">
          <b>📱 Ecrane:</b> ${escapeHtml(p.screens || "—")} •
          <b>⏳ Bonus:</b> ${escapeHtml(p.bonusTime || "—")} •
          <b>🔥 Streak:</b> ${escapeHtml(p.streak || "—")}
        </div>
        <div class="row">
          <span class="tag">Zile fixe: ${p.fixedDays || 0}</span>
          <span class="tag">Puncte/zi: ${p.pointsPerDay || 0}</span>
        </div>
        ${p.reEntry ? `<div class="hr"></div><div class="small"><b>🔁 Re-entry:</b> ${escapeHtml(p.reEntry)}</div>` : ""}
      </div>
    `).join("");
}

function renderRules() {
  const v = $("#view-rules");

  const principal = data.rules.filter(r => (r.type || "").toLowerCase().includes("principal"));
  const secundar = data.rules.filter(r => !((r.type || "").toLowerCase().includes("principal")));

  v.innerHTML = `
    <div class="card">
      <h3>📜 Reguli</h3>
      <p>Regulile sunt LIVE din tab-ul <b>_Rules</b>. Jocul e corect: explici o dată, apoi jocul vorbește.</p>
    </div>

    <div class="grid" style="margin-top:12px;">
      <div class="card">
        <h3>🏛️ Reguli principale</h3>
        <div style="display:grid; gap:10px; margin-top:10px;">
          ${principal.length ? principal.map(r => `
            <div class="card" style="padding:10px; background:rgba(255,255,255,.03)">
              <div style="font-weight:850">${escapeHtml(r.title || "Regulă")}</div>
              <div class="small">${escapeHtml(r.text)}</div>
            </div>
          `).join("") : `<div class="small">—</div>`}
        </div>
      </div>

      <div class="card">
        <h3>🧩 Reguli secundare</h3>
        <div style="display:grid; gap:10px; margin-top:10px;">
          ${secundar.length ? secundar.map(r => `
            <div class="card" style="padding:10px; background:rgba(255,255,255,.03)">
              <div style="font-weight:850">${escapeHtml(r.title || "Regulă")}</div>
              <div class="small">${escapeHtml(r.text)}</div>
            </div>
          `).join("") : `<div class="small">—</div>`}
        </div>
      </div>
    </div>
  `;
}

function renderHistory() {
  const v = $("#view-history");

  const items = state.history.slice(0, 60);
  v.innerHTML = `
    <div class="card">
      <h3>🧾 Istoric</h3>
      <p>Ultimele acțiuni (salvate local). Pentru sync între device-uri, următorul pas este Firestore.</p>
    </div>

    <div style="margin-top:12px; display:grid; gap:10px;">
      ${items.length ? items.map(h => `
        <div class="card" style="padding:12px">
          <div style="display:flex; justify-content:space-between; gap:10px;">
            <div style="font-weight:850">${escapeHtml(h.title)}</div>
            <div class="small">${new Date(h.ts).toLocaleString()}</div>
          </div>
          <div class="small">XP: ${h.deltaXp >= 0 ? "+" : ""}${h.deltaXp} • Timp: ${h.deltaTime >= 0 ? "+" : ""}${h.deltaTime} min</div>
        </div>
      `).join("") : `<div class="small">— nu există încă acțiuni —</div>`}
    </div>
  `;
}

function renderReport() {
  const v = $("#view-report");

  const today = dayKey();
  const todayCount = Object.values(state.completedToday).reduce((a,b)=>a+b,0);

  // statistici rapide din history (ultimele 7 zile aproximativ)
  const now = Date.now();
  const seven = 7 * 24 * 60 * 60 * 1000;
  const recent = state.history.filter(h => (now - h.ts) <= seven);

  const xp7 = recent.reduce((s,h)=>s + (h.deltaXp || 0),0);
  const time7 = recent.reduce((s,h)=>s + (h.deltaTime || 0),0);

  v.innerHTML = `
    <div class="grid">
      <div class="card">
        <h3>📊 Raport rapid</h3>
        <p>Sumar local (ultimele ~7 zile). Pentru raport PDF real, îl construim după sync.</p>
        <div class="hr"></div>
        <div class="row"><span class="tag">📅 Azi</span><span class="tag good">Misiuni: ${todayCount}</span></div>
        <div class="row"><span class="tag">✨ XP (7 zile)</span><span class="tag">${xp7}</span></div>
        <div class="row"><span class="tag">⏳ Timp net (7 zile)</span><span class="tag">${time7} min</span></div>
        <div class="row"><span class="tag">🔥 Streak</span><span class="tag">${state.streak}</span></div>
      </div>

      <div class="card">
        <h3>🧠 Recomandare de sistem</h3>
        <p class="small">
          Dacă apar multe penalități de tip <b>grav</b>, următorul upgrade e să activăm “Re-entry Quest” din tab-ul _Penalitati:
          raport + reparație + zi de probă. Jocul rămâne corect, fără negocieri.
        </p>
      </div>

      <div class="card">
        <h3>🛍️ Magazin (placeholder)</h3>
        <p class="small">În v1.01 conectăm “Shop Rewards” tot din Sheets și debităm timpul.</p>
      </div>
    </div>
  `;
}

function renderShop() {
  const v = $("#view-shop");
  v.innerHTML = `
    <div class="card">
      <h3>🛍️ Magazin</h3>
      <p>Urmează: carduri de recompense (cost în minute) + animații + confirmări.</p>
      <div class="hr"></div>
      <div class="small">Momentan: Magazinul este activ ca tab, dar nu are inventar.</div>
    </div>
  `;
}

function renderActiveView(view) {
  if (view === "dashboard") renderDashboard();
  if (view === "missions") renderMissions();
  if (view === "penalties") renderPenalties();
  if (view === "rules") renderRules();
  if (view === "history") renderHistory();
  if (view === "report") renderReport();
  if (view === "shop") renderShop();
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function cssSafe(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function refreshData() {
  setSubtitle("🔄 Încarc date LIVE…");
  try {
    const [missions, penalties, rules] = await Promise.all([
      loadMissionsLive(),
      loadPenaltiesLive(),
      loadRulesLive()
    ]);
    data = { missions, penalties, rules };
    setSubtitle(`✅ LIVE: ${missions.length} misiuni • ${penalties.length} penalități • ${rules.length} reguli`);
  } catch (e) {
    console.error(e);
    setSubtitle("⚠️ Nu pot încărca Google Sheets. Verifică share: Anyone with the link (Viewer).");
    showToast("⚠️ Eroare la încărcare LIVE");
  }
}

function bindTopButtons() {
  $("#btnRefresh").addEventListener("click", async () => {
    await refreshData();
    const active = $(".nav-item.active")?.dataset?.view || "dashboard";
    renderActiveView(active);
    showToast("🔄 Refresh complet");
  });

  $("#btnPlayMode").addEventListener("click", () => {
    state.playMode = !state.playMode;
    saveState();
    updateStatsUI();
    showToast(state.playMode ? "🎮 Play Mode ON" : "🛑 Play Mode OFF");
  });
}

async function init() {
  // PWA SW
  if ("serviceWorker" in navigator) {
    try { await navigator.serviceWorker.register("./sw.js"); } catch {}
  }

  resetDailyIfNeeded();
  updateStatsUI();
  bindNav();
  bindTopButtons();

  await refreshData();

  // render default view
  renderActiveView("dashboard");
}

init();
