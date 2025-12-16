import { MISSIONS, MISSION_CATEGORIES } from "./missions.js";
import { PENALTIES, PENALTY_LEVELS } from "./penalties.js";
import { RULE_SECTIONS } from "./rules.js";

/** =========================
 *  STATE (local only, for now)
 *  ========================= */
const STORAGE_KEY = "timearena_demo_state_v01";

const defaultState = () => ({
  kidName: "Nikita",
  timeBalance: 0,   // minutes
  xp: 0,
  level: 1,
  nextXp: 100,
  streak: 0,

  // daily stats (reset when day changes)
  dayKey: todayKey(),
  earnedToday: 0,
  lostToday: 0,
  doneToday: [],

  // events history
  events: [] // {ts, type:'mission'|'penalty'|'bonus'|'system', title, minutesDelta, xpDelta}
});

let state = loadState();

/** =========================
 *  DOM refs
 *  ========================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const sidebar = $("#sidebar");
const btnMenu = $("#btnMenu");
const btnQuickAdd = $("#btnQuickAdd");
const btnReset = $("#btnReset");

const timeBalanceEl = $("#timeBalance");
const levelEl = $("#level");
const streakEl = $("#streak");
const xpEl = $("#xp");
const nextXpEl = $("#nextXp");
const xpBar = $("#xpBar");

const motivationEl = $("#motivation");
const motivationHintEl = $("#motivationHint");

const kidNameLabel = $("#kidNameLabel");
const kidNameHello = $("#kidNameHello");

const doneTodayEl = $("#doneToday");
const earnedTodayEl = $("#earnedToday");
const lostTodayEl = $("#lostToday");

const latestEventsEl = $("#latestEvents");
const historyListEl = $("#historyList");
const reportBoxEl = $("#reportBox");

const categorySelect = $("#categorySelect");
const searchInput = $("#searchInput");
const missionsGrid = $("#missionsGrid");

const penaltyLevelSelect = $("#penaltyLevelSelect");
const penaltiesGrid = $("#penaltiesGrid");

const rulesList = $("#rulesList");

const toast = $("#toast");
const confettiCanvas = $("#confetti");

/** =========================
 *  Boot
 *  ========================= */
ensureTodayReset();
renderAll();
wireUI();
registerSW();

/** =========================
 *  UI wiring
 *  ========================= */
function wireUI(){
  // mobile menu
  btnMenu.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    const isMobile = window.matchMedia("(max-width: 980px)").matches;
    if (!isMobile) return;
    if (sidebar.classList.contains("open")) {
      const clickInside = sidebar.contains(e.target) || btnMenu.contains(e.target);
      if (!clickInside) sidebar.classList.remove("open");
    }
  });

  // nav
  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showView(btn.dataset.view);
      sidebar.classList.remove("open");
    });
  });

  // dashboard jump buttons
  $$("[data-jump]").forEach(b => {
    b.addEventListener("click", () => {
      const v = b.dataset.jump;
      const navBtn = $(`.nav-item[data-view="${v}"]`);
      if (navBtn) navBtn.click();
    });
  });

  // dashboard chips filter -> missions view
  $$(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.filter;
      const navBtn = $(`.nav-item[data-view="missions"]`);
      if (navBtn) navBtn.click();
      categorySelect.value = cat;
      renderMissions();
    });
  });

  // quick add bonus
  btnQuickAdd.addEventListener("click", () => {
    // small friendly prompt: +10 min
    applyDelta({
      type: "bonus",
      title: "Bonus Rapid",
      minutesDelta: 10,
      xpDelta: 5
    });
    popToast("✨ Bonus +10 min");
    burstConfetti();
  });

  // reset local
  btnReset.addEventListener("click", () => {
    state = defaultState();
    saveState();
    renderAll();
    popToast("Reset local făcut.");
  });

  // missions filters
  categorySelect.addEventListener("change", renderMissions);
  searchInput.addEventListener("input", renderMissions);

  // penalties filters
  penaltyLevelSelect.addEventListener("change", renderPenalties);

  // export json
  $("#btnExportJson").addEventListener("click", exportJSON);
}

/** =========================
 *  Views
 *  ========================= */
function showView(name){
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#view-${name}`).classList.remove("hidden");
}

/** =========================
 *  Render
 *  ========================= */
function renderAll(){
  renderHeader();
  renderDashboard();
  renderSelects();
  renderMissions();
  renderPenalties();
  renderRules();
  renderHistory();
  renderReport();
}

function renderHeader(){
  kidNameLabel.textContent = state.kidName;
  kidNameHello.textContent = state.kidName;
}

function renderDashboard(){
  timeBalanceEl.textContent = state.timeBalance;
  levelEl.textContent = state.level;
  streakEl.textContent = state.streak;
  xpEl.textContent = state.xp;
  nextXpEl.textContent = state.nextXp;

  const pct = Math.max(0, Math.min(100, Math.round((state.xp / state.nextXp) * 100)));
  xpBar.style.width = `${pct}%`;

  doneTodayEl.textContent = state.doneToday.length;
  earnedTodayEl.textContent = state.earnedToday;
  lostTodayEl.textContent = state.lostToday;

  // motivation badge (simple logic)
  const score = state.timeBalance + state.streak * 10;
  let label = "OK", hint = "Ține ritmul 2 zile la rând.";
  if (score >= 120) { label = "LEGENDAR"; hint = "Ești în formă! Păstrează disciplina."; }
  else if (score >= 60) { label = "BUN"; hint = "Încă 1 misiune mare și e perfect."; }
  else if (score < 0) { label = "CRITIC"; hint = "Revii în joc cu 1 misiune obligatorie."; }

  motivationEl.textContent = label;
  motivationHintEl.textContent = hint;

  // latest events
  const latest = [...state.events].sort((a,b) => b.ts - a.ts).slice(0, 6);
  latestEventsEl.innerHTML = latest.length ? latest.map(evCard).join("") : `<div class="muted">Nimic încă. Începe cu o misiune.</div>`;
}

function renderSelects(){
  // missions categories
  categorySelect.innerHTML = MISSION_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("");
  if (!categorySelect.value) categorySelect.value = "Toate";

  // penalty levels
  penaltyLevelSelect.innerHTML = PENALTY_LEVELS.map(l => `<option value="${l}">${l}</option>`).join("");
  if (!penaltyLevelSelect.value) penaltyLevelSelect.value = "Toate";
}

function renderMissions(){
  const cat = categorySelect.value || "Toate";
  const q = (searchInput.value || "").trim().toLowerCase();

  const list = MISSIONS
    .filter(m => cat === "Toate" ? true : m.category === cat)
    .filter(m => q ? (m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)) : true);

  missionsGrid.innerHTML = list.map(m => `
    <div class="card-item">
      <div class="title">${escapeHtml(m.title)}</div>
      <div class="desc">${escapeHtml(m.desc)}</div>
      <div class="tagrow">
        <span class="tag blue">${escapeHtml(m.category)}</span>
        <span class="tag good">+${m.minutes} min</span>
        <span class="tag">+${m.xp} XP</span>
        <span class="tag">Limită: ${m.dailyLimit}/zi</span>
      </div>
      <div class="actions">
        <button class="small" data-mission="${m.id}">Completează</button>
      </div>
    </div>
  `).join("");

  // bind complete buttons
  $$("[data-mission]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.mission;
      const m = MISSIONS.find(x => x.id === id);
      if (!m) return;

      ensureTodayReset();

      // daily limit
      const doneCount = state.doneToday.filter(x => x === id).length;
      if (doneCount >= (m.dailyLimit || 1)) {
        popToast("Limită zilnică atinsă pentru această misiune.");
        return;
      }

      // apply
      applyDelta({
        type: "mission",
        title: m.title,
        minutesDelta: m.minutes,
        xpDelta: m.xp
      });

      state.doneToday.push(id);
      state.earnedToday += m.minutes;

      // streak logic: if first meaningful action today, keep it simple
      if (state.doneToday.length === 1) {
        state.streak += 1;
      }

      saveState();
      renderAll();

      popToast(`✅ +${m.minutes} min • ${m.title}`);
      burstConfetti();
      playTick();
    });
  });
}

function renderPenalties(){
  const lvl = penaltyLevelSelect.value || "Toate";
  const list = PENALTIES.filter(p => (lvl === "Toate" ? true : p.level === lvl));

  penaltiesGrid.innerHTML = list.map(p => `
    <div class="card-item">
      <div class="title">${escapeHtml(p.title)}</div>
      <div class="desc">${escapeHtml(p.desc)}</div>
      <div class="tagrow">
        <span class="tag bad">-${p.minutesLost} min</span>
        <span class="tag">${escapeHtml(p.level)}</span>
      </div>
      <div class="actions">
        <button class="small" data-penalty="${p.id}">Aplică</button>
      </div>
    </div>
  `).join("");

  $$("[data-penalty]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.penalty;
      const p = PENALTIES.find(x => x.id === id);
      if (!p) return;

      ensureTodayReset();

      applyDelta({
        type: "penalty",
        title: p.title,
        minutesDelta: -Math.abs(p.minutesLost),
        xpDelta: 0
      });

      state.lostToday += p.minutesLost;

      // streak punishment: if a "grav" and time goes negative, reset streak
      if (p.level === "Grav" && state.timeBalance < 0) state.streak = 0;

      saveState();
      renderAll();

      popToast(`💥 -${p.minutesLost} min • ${p.title}`);
      playBuzz();
    });
  });
}

function renderRules(){
  rulesList.innerHTML = RULE_SECTIONS.map(sec => `
    <div class="rule">
      <div class="h">${escapeHtml(sec.title)}</div>
      <div class="p"></div>
      ${sec.items.map(item => `
        <div class="rule" style="margin-top:10px">
          <div class="h">${escapeHtml(item.headline)}</div>
          <div class="p">${escapeHtml(item.text)}</div>
          <div class="k">${(item.tags||[]).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        </div>
      `).join("")}
    </div>
  `).join("");
}

function renderHistory(){
  const list = [...state.events].sort((a,b) => b.ts - a.ts);
  historyListEl.innerHTML = list.length ? list.map(evCard).join("") : `<div class="muted">Istoric gol.</div>`;
}

function renderReport(){
  // last 7 days summary by dayKey
  const now = Date.now();
  const days = [];
  for (let i=6;i>=0;i--){
    const d = new Date(now - i*24*60*60*1000);
    const key = d.toISOString().slice(0,10);
    days.push(key);
  }

  const byDay = Object.fromEntries(days.map(k => [k, {earned:0, lost:0, missions:0, penalties:0}]));

  for (const ev of state.events){
    const key = new Date(ev.ts).toISOString().slice(0,10);
    if (!byDay[key]) continue;
    if (ev.minutesDelta > 0) byDay[key].earned += ev.minutesDelta;
    if (ev.minutesDelta < 0) byDay[key].lost += Math.abs(ev.minutesDelta);
    if (ev.type === "mission") byDay[key].missions += 1;
    if (ev.type === "penalty") byDay[key].penalties += 1;
  }

  const lines = days.map(k => {
    const x = byDay[k];
    return `• ${k}: +${x.earned} min / -${x.lost} min • misiuni ${x.missions} • penalități ${x.penalties}`;
  }).join("<br>");

  reportBoxEl.innerHTML = `
    <div><b>Ultimele 7 zile</b></div>
    <div style="margin-top:10px">${lines}</div>
    <div style="margin-top:12px;color:var(--muted)">
      Notă: e raport local (până la Sync/Firestore).
    </div>
  `;
}

/** =========================
 *  Engine helpers
 *  ========================= */
function applyDelta({type, title, minutesDelta, xpDelta}){
  state.timeBalance += minutesDelta;

  // xp + level
  if (xpDelta && xpDelta > 0) {
    state.xp += xpDelta;
    while (state.xp >= state.nextXp) {
      state.xp -= state.nextXp;
      state.level += 1;
      state.nextXp = Math.round(state.nextXp * 1.2);
      popToast(`🆙 Level Up! Lv ${state.level}`);
      burstConfetti();
    }
  }

  state.events.push({
    ts: Date.now(),
    type,
    title,
    minutesDelta,
    xpDelta: xpDelta || 0
  });
}

function evCard(ev){
  const dt = new Date(ev.ts);
  const when = dt.toLocaleString("ro-RO", {hour12:false});
  const sign = ev.minutesDelta >= 0 ? "+" : "-";
  const val = `${sign}${Math.abs(ev.minutesDelta)} min`;

  return `
    <div class="event">
      <div class="left">
        <div class="t">${escapeHtml(ev.title)}</div>
        <div class="s">${escapeHtml(ev.type)} • ${when}</div>
      </div>
      <div class="v">${val}</div>
    </div>
  `;
}

function todayKey(){
  return new Date().toISOString().slice(0,10);
}

function ensureTodayReset(){
  const key = todayKey();
  if (state.dayKey !== key){
    // new day: reset daily stats, streak logic: if yesterday had 0 missions, reset streak
    const hadProgress = state.doneToday && state.doneToday.length > 0;
    if (!hadProgress) state.streak = 0;

    state.dayKey = key;
    state.earnedToday = 0;
    state.lostToday = 0;
    state.doneToday = [];
    saveState();

    state.events.push({ts: Date.now(), type:"system", title:"Zi nouă", minutesDelta:0, xpDelta:0});
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return { ...defaultState(), ...s };
  }catch{
    return defaultState();
  }
}

/** =========================
 *  Toast
 *  ========================= */
let toastTimer = null;
function popToast(msg){
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2200);
}

/** =========================
 *  Confetti (lightweight)
 *  ========================= */
function burstConfetti(){
  const c = confettiCanvas;
  const ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  c.width = Math.floor(window.innerWidth * dpr);
  c.height = Math.floor(window.innerHeight * dpr);
  c.style.width = window.innerWidth + "px";
  c.style.height = window.innerHeight + "px";
  ctx.scale(dpr, dpr);

  const parts = Array.from({length: 90}, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random()*200,
    r: 2 + Math.random()*4,
    vy: 2 + Math.random()*4,
    vx: -1.5 + Math.random()*3,
    a: 1
  }));

  let t = 0;
  const anim = () => {
    t++;
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    parts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.a -= 0.012;
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (t < 90) requestAnimationFrame(anim);
    else ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
  };
  anim();
}

/** =========================
 *  Sounds (tiny + optional)
 *  ========================= */
function beep(freq=660, dur=0.08){
  try{
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g); g.connect(ac.destination);
    o.start();
    setTimeout(() => { o.stop(); ac.close(); }, dur*1000);
  }catch{}
}
function playTick(){ beep(740, 0.06); }
function playBuzz(){ beep(220, 0.10); }

/** =========================
 *  Export JSON (history)
 *  ========================= */
function exportJSON(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "TimeArena_demo_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

/** =========================
 *  Service Worker register
 *  ========================= */
function registerSW(){
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

/** =========================
 *  Utils
 *  ========================= */
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
