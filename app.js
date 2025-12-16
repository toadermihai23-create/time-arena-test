/* ======================================================
   TimeArena demo — App Engine
   ====================================================== */

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "timearena_demo_state_v1";
const TODAY_KEY = () => new Date().toISOString().slice(0,10);

function defaultState(){
  return {
    role: null,               // "child" | "parent"
    parentPin: "1234",
    playMode: false,          // parent toggle
    minutes: 0,
    streak: 0,
    dayKey: TODAY_KEY(),
    completedToday: {},       // { missionId: true }
    unlocksToday: { playstation:false, youtube:false, daily_play:false },
    history: [],              // array of events
    playBlocked: false,       // severe penalty -> Play OFF until recovery done
    recoveryDone: {},         // { recoveryId: true } for current lock
  };
}

let state = loadState();
syncDayReset();
applyRoleUI();
initNav();
initTopControls();
initRulesControls();
renderAll();
registerSW();

/* -------------------- State -------------------- */
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const s = JSON.parse(raw);
    return { ...defaultState(), ...s };
  }catch(e){
    return defaultState();
  }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncDayReset(){
  const today = TODAY_KEY();
  if(state.dayKey !== today){
    // new day reset daily stuff, keep minutes? (we keep minutes bank, reset completions)
    state.dayKey = today;
    state.completedToday = {};
    state.unlocksToday = { playstation:false, youtube:false, daily_play:false };
    state.playBlocked = false;
    state.recoveryDone = {};
    logEvent("SYSTEM", "Zi nouă: reset completări", 0);
    saveState();
  }
}

/* -------------------- Login / Role -------------------- */
const loginOverlay = $("loginOverlay");
const pinWrap = $("pinWrap");
const pinInput = $("pinInput");

$("btnChild").onclick = () => {
  state.role = "child";
  saveState();
  closeLogin();
  applyRoleUI();
  renderAll();
};

$("btnParent").onclick = () => {
  pinWrap.classList.remove("hidden");
  pinInput.focus();
};

$("pinCancel").onclick = () => {
  pinWrap.classList.add("hidden");
  pinInput.value = "";
};

$("pinOk").onclick = () => {
  const pin = (pinInput.value || "").trim();
  if(pin !== (state.parentPin || "1234")){
    alert("PIN greșit.");
    return;
  }
  state.role = "parent";
  saveState();
  closeLogin();
  applyRoleUI();
  renderAll();
};

$("btnSwitchRole").onclick = () => {
  state.role = null;
  saveState();
  openLogin();
};

function openLogin(){
  loginOverlay.classList.remove("hidden");
  pinWrap.classList.add("hidden");
  pinInput.value = "";
}
function closeLogin(){
  loginOverlay.classList.add("hidden");
}
function applyRoleUI(){
  $("rolePill").textContent = `Rol: ${state.role ? (state.role==="parent" ? "Părinte" : "Copil") : "—"}`;

  document.querySelectorAll(".parent-only").forEach(el=>{
    el.style.display = state.role === "parent" ? "inline-flex" : "none";
  });

  if(!state.role) openLogin();
  else closeLogin();
}

/* -------------------- Navigation -------------------- */
function initNav(){
  document.querySelectorAll(".nav-item").forEach(btn=>{
    btn.onclick = () => {
      document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;
      document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
      $(view).classList.add("active");
    };
  });
}

/* -------------------- Top Controls -------------------- */
function initTopControls(){
  $("togglePlayMode").onclick = () => {
    if(state.role !== "parent") return;
    state.playMode = !state.playMode;
    logEvent("PARENT", `Play Mode => ${state.playMode ? "ON" : "OFF"}`, 0);
    saveState();
    renderHeader();
    renderDashboard();
  };

  $("resetDay").onclick = () => {
    if(state.role !== "parent") return;
    if(!confirm("Reset completări pentru azi?")) return;
    state.completedToday = {};
    state.unlocksToday = { playstation:false, youtube:false, daily_play:false };
    state.playBlocked = false;
    state.recoveryDone = {};
    logEvent("PARENT", "Reset zi", 0);
    saveState();
    renderAll();
  };

  $("clearHistory").onclick = () => {
    if(state.role !== "parent") return;
    if(!confirm("Ștergi istoricul?")) return;
    state.history = [];
    saveState();
    renderHistory();
  };

  $("endDay").onclick = () => {
    if(state.role !== "parent") return;

    const mandatoryDone = mandatoryUnlocksDone();
    const success = mandatoryDone && !state.playBlocked;

    state.streak = success ? (state.streak + 1) : 0;
    logEvent("PARENT", `Închidere zi: ${success ? "SUCCES" : "FAIL"} (streak=${state.streak})`, 0);
    saveState();
    renderDashboard();
  };

  $("exportPdf").onclick = () => {
    if(state.role !== "parent") return;
    exportPDF();
  };

  // Mission search/filter
  $("searchMissions").addEventListener("input", renderMissions);
  $("filterCategory").addEventListener("change", renderMissions);
}

/* -------------------- Rules Controls -------------------- */
function initRulesControls(){
  $("savePin").onclick = () => {
    if(state.role !== "parent") return;
    const val = ($("pinNew").value || "").trim();
    if(val.length < 3) return alert("PIN prea scurt.");
    state.parentPin = val;
    $("pinNew").value = "";
    logEvent("PARENT", "PIN schimbat", 0);
    saveState();
    alert("PIN salvat.");
  };
}

/* -------------------- Rendering -------------------- */
function renderAll(){
  renderHeader();
  renderDashboard();
  renderMissions();
  renderShop();
  renderPenalties();
  renderHistory();
}

function renderHeader(){
  $("playModeChip").textContent = state.playMode ? "🟢 Play Mode ON" : "🔒 Play Mode OFF";

  const unlockTxt = [];
  unlockTxt.push(state.unlocksToday.playstation ? "🎮 PS" : "🎮 PS (LOCK)");
  unlockTxt.push(state.unlocksToday.youtube ? "📺 YT" : "📺 YT (LOCK)");
  unlockTxt.push(state.unlocksToday.daily_play ? "✅ Daily" : "⛔ Daily");
  $("unlockChip").textContent = "🔓 Unlock: " + unlockTxt.join(" • ");
}

function renderDashboard(){
  const minutes = state.minutes;
  const level = calcLevel(minutes);
  const motivation = calcMotivation(level, state.streak);

  $("statMinutes").textContent = minutes;
  $("statLevel").textContent = level;
  $("statMotivation").textContent = `${motivation}%`;
  $("statStreak").textContent = state.streak;

  const progress = minutes % 100;
  $("progressText").textContent = `${progress} / 100`;
  $("progressFill").style.width = `${Math.min(100, progress)}%`;
  $("levelBadge").textContent = `LEVEL ${level}`;

  // pills unlock
  const pills = [];
  pills.push(pill("🎮 PlayStation", state.unlocksToday.playstation));
  pills.push(pill("📺 YouTube/Desene", state.unlocksToday.youtube));
  pills.push(pill("✅ Daily Play", state.unlocksToday.daily_play));
  pills.push(pill("🛑 Play Blocked", !state.playBlocked ? true : false, state.playBlocked ? "off" : "on"));
  $("unlockPills").innerHTML = "";
  pills.forEach(p=> $("unlockPills").appendChild(p));

  // quick missions (top 5 winners)
  $("quickMissions").innerHTML = "";
  const quick = window.MISSIONS.winners.slice(0,5);
  quick.forEach(m=>{
    const el = document.createElement("div");
    el.className = "quick-item";
    el.innerHTML = `
      <div>
        <strong>${m.title}</strong>
        <p>${m.desc}</p>
      </div>
      <button class="mini-btn">+${m.points}</button>
    `;
    el.querySelector("button").onclick = ()=> completeMission(m, "win");
    $("quickMissions").appendChild(el);
  });

  renderHeader();
}

function renderMissions(){
  const q = ($("searchMissions").value || "").toLowerCase().trim();
  const cat = $("filterCategory").value;

  const pass = (m) => {
    const text = `${m.title} ${m.desc}`.toLowerCase();
    const catOk = (cat === "all") || (m.category === cat) || (m.tag === cat);
    const qOk = !q || text.includes(q);
    return catOk && qOk;
  };

  renderMissionGrid("listUnlock", window.MISSIONS.unlock.filter(pass), "unlock");
  renderMissionGrid("listWinners", window.MISSIONS.winners.filter(pass), "win");
  renderMissionGrid("listBonus", window.MISSIONS.bonus.filter(pass), "bonus");
  renderMissionGrid("listRecovery", window.MISSIONS.recovery.filter(pass), "recovery");
}

function renderPenalties(){
  renderMissionGrid("listPenalties", window.MISSIONS.penalties, "damage");
}

function renderShop(){
  const grid = $("shopGrid");
  grid.innerHTML = "";

  window.MISSIONS.shop.forEach(item=>{
    const card = document.createElement("div");
    card.className = "shop-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <p><b>Cost:</b> ${item.cost} min</p>
      <button>Cumpără</button>
    `;
    card.querySelector("button").onclick = ()=> buyShop(item);
    grid.appendChild(card);
  });
}

function renderHistory(){
  const list = $("historyList");
  list.innerHTML = "";

  const recent = state.history.slice(-50).reverse();
  if(recent.length === 0){
    list.innerHTML = `<div class="tiny">Nimic încă.</div>`;
    return;
  }

  recent.forEach(h=>{
    const item = document.createElement("div");
    item.className = "hist-item";
    item.innerHTML = `
      <div class="hist-top">
        <div>${h.actor}: ${h.action}</div>
        <div>${h.delta > 0 ? "+" : ""}${h.delta}</div>
      </div>
      <div class="hist-sub">${h.time}</div>
    `;
    list.appendChild(item);
  });
}

/* -------------------- Mission Grid -------------------- */
function renderMissionGrid(containerId, list, mode){
  const container = $(containerId);
  container.innerHTML = "";

  list.forEach(m=>{
    const done = !!state.completedToday[m.id];
    const card = document.createElement("div");
    card.className = "mission-card" + (done ? " completed" : "");

    const tagClass =
      mode==="win" ? "win" :
      mode==="unlock" ? "unlock" :
      mode==="bonus" ? "bonus" :
      mode==="recovery" ? "recovery" : "damage";

    const tagText =
      mode==="win" ? `+${m.points}` :
      mode==="bonus" ? `+${m.points}` :
      mode==="unlock" ? "UNLOCK" :
      mode==="recovery" ? "RESET" : `-${m.damage}`;

    const lockHint = (mode==="damage" && m.blockPlay) ? " • PLAY OFF" : "";
    const bonusHint = (mode==="damage" && m.blockBonus) ? " • BONUS OFF" : "";

    card.innerHTML = `
      <div>
        <strong>${m.title}</strong>
        <p>${m.desc}${lockHint}${bonusHint}</p>
      </div>
      <div class="meta">
        <div class="tag ${tagClass}">${tagText}</div>
        <button class="do-btn" title="Aplică">✔</button>
      </div>
    `;

    card.querySelector(".do-btn").onclick = () => {
      if(mode === "damage") applyPenalty(m);
      else completeMission(m, mode);
    };

    container.appendChild(card);
  });
}

/* -------------------- Core Game Logic -------------------- */
function completeMission(m, mode){
  if(state.role === "child" && !state.playMode){
    beep("no");
    alert("🔒 Play Mode este OFF (doar părintele îl pornește).");
    return;
  }
  if(state.playBlocked && mode !== "recovery"){
    beep("no");
    alert("🛑 Play este blocat. Fă misiunile de Revenire în Joc.");
    return;
  }

  // avoid double
  if(state.completedToday[m.id]){
    beep("no");
    return;
  }

  state.completedToday[m.id] = true;

  if(mode === "win" || mode === "bonus"){
    state.minutes += Number(m.points || 0);
    logEvent("GAME", `Misiune completată: ${m.title}`, Number(m.points || 0));
    successFX();

    // level up check
    checkLevelUp();

  } else if(mode === "unlock"){
    // mark unlocks
    (m.unlocks || []).forEach(u=>{
      if(u === "playstation") state.unlocksToday.playstation = true;
      if(u === "youtube") state.unlocksToday.youtube = true;
      if(u === "daily_play") state.unlocksToday.daily_play = true;
    });
    logEvent("GAME", `Deblocare: ${m.title}`, 0);
    successFX(false);

  } else if(mode === "recovery"){
    state.recoveryDone[m.id] = true;
    logEvent("GAME", `Recovery: ${m.title}`, 0);
    successFX(false);

    // if all recovery complete -> unblock
    const allRec = window.MISSIONS.recovery.every(x => state.recoveryDone[x.id]);
    if(allRec){
      state.playBlocked = false;
      logEvent("SYSTEM", "Revenire în joc completă — Play unblocked", 0);
      toast("🟣 Back in game!");
      confetti({ particleCount: 90, spread: 70, origin:{y:.7} });
    }
  }

  saveState();
  renderAll();
}

function applyPenalty(p){
  if(state.role !== "parent"){
    beep("no");
    alert("Doar părintele poate aplica penalități.");
    return;
  }

  // damage affects minutes (bank)
  state.minutes = Math.max(0, state.minutes - Number(p.damage || 0));
  logEvent("PARENT", `Penalty: ${p.title}`, -Number(p.damage || 0));

  // effects
  damageFX();

  if(p.blockBonus){
    // practical effect: parent can enforce "no bonus" by ignoring bonus missions (UX note)
    toast("🚫 BONUS OFF (azi)");
  }

  if(p.blockPlay){
    state.playBlocked = true;
    state.recoveryDone = {};
    toast("🛑 PLAY OFF — Revenire în joc necesară");
  }

  saveState();
  renderAll();
}

/* -------------------- Shop -------------------- */
function buyShop(item){
  if(state.role !== "parent"){
    beep("no");
    alert("Doar părintele confirmă cumpărăturile.");
    return;
  }
  if(state.minutes < item.cost){
    beep("no");
    alert("Nu ai suficiente minute.");
    return;
  }

  state.minutes -= item.cost;
  logEvent("SHOP", `Cumpărat: ${item.title}`, -item.cost);

  // apply effect
  if(item.effect?.addMinutes){
    // This adds minutes as a “reward item” – you can instead store “grants” if you want stricter accounting.
    state.minutes += item.effect.addMinutes;
    logEvent("SHOP", `Recompensă aplicată: +${item.effect.addMinutes} min`, item.effect.addMinutes);
  }
  if(item.effect?.badge){
    toast(`🏷️ Badge: ${item.effect.badge}`);
  }

  saveState();
  renderAll();
  successFX(false);
}

/* -------------------- Calculations -------------------- */
function calcLevel(minutes){
  return Math.floor(minutes / 100) + 1;
}
function calcMotivation(level, streak){
  // simple formula: base 60 + level*4 + streak*3 (cap 100)
  return Math.min(100, 60 + level*4 + streak*3);
}
function mandatoryUnlocksDone(){
  const u = state.unlocksToday;
  return !!(u.playstation && u.youtube && u.daily_play);
}
function checkLevelUp(){
  const prev = state._lastLevel || calcLevel(state.minutes - 1);
  const now = calcLevel(state.minutes);
  state._lastLevel = now;

  if(now > prev){
    toast("⭐ LEVEL UP!");
    confetti({ particleCount: 110, spread: 85, origin:{y:.7} });
    beep("level");
  }
}

/* -------------------- UI Helpers / FX -------------------- */
function pill(text, on, forced){
  const el = document.createElement("div");
  el.className = "pill " + (forced ? forced : (on ? "on" : "off"));
  el.textContent = text;
  return el;
}

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(()=> t.classList.add("hidden"), 1200);
}

function successFX(conf=true){
  beep("ok");
  if(conf){
    confetti({ particleCount: 70, spread: 65, origin:{y:.65} });
  }
}
function damageFX(){
  beep("bad");
  document.body.classList.add("flash-red", "shake");
  setTimeout(()=> document.body.classList.remove("flash-red", "shake"), 260);
}

function beep(type){
  // tiny web-audio beep (no external files)
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);

    const cfg = {
      ok: {f: 640, d: 0.07},
      bad:{f: 180, d: 0.12},
      no: {f: 120, d: 0.10},
      level:{f: 860, d: 0.10},
    }[type] || {f: 440, d: 0.08};

    o.frequency.value = cfg.f;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + cfg.d);

    o.start();
    o.stop(ctx.currentTime + cfg.d + 0.02);
  }catch(e){}
}

/* -------------------- History -------------------- */
function logEvent(actor, action, delta){
  const now = new Date();
  const time = now.toLocaleString();
  state.history.push({
    actor, action, delta,
    time,
    day: state.dayKey
  });
  // keep it light
  if(state.history.length > 500) state.history = state.history.slice(-500);
}

/* -------------------- PDF Report -------------------- */
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const last7 = lastDays(7);
  const events = state.history.filter(h => last7.includes(h.day));

  doc.setFontSize(14);
  doc.text("TimeArena demo — Raport (ultimele 7 zile)", 10, 14);

  doc.setFontSize(10);
  doc.text(`Zi curentă: ${state.dayKey}`, 10, 22);
  doc.text(`Minute: ${state.minutes} | Level: ${calcLevel(state.minutes)} | Streak: ${state.streak}`, 10, 28);
  doc.text(`Play Mode: ${state.playMode ? "ON" : "OFF"} | Play Blocked: ${state.playBlocked ? "YES" : "NO"}`, 10, 34);

  let y = 44;
  doc.setFontSize(11);
  doc.text("Evenimente:", 10, y);
  y += 8;

  doc.setFontSize(9);
  const lines = events.slice(-60).map(e => `${e.day} | ${e.actor} | ${e.action} (${e.delta > 0 ? "+" : ""}${e.delta})`);
  for(const line of lines){
    if(y > 285){
      doc.addPage();
      y = 14;
    }
    doc.text(line.substring(0, 110), 10, y);
    y += 6;
  }

  doc.save(`TimeArena_demo_Raport_${state.dayKey}.pdf`);
}

function lastDays(n){
  const arr = [];
  for(let i=0;i<n;i++){
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0,10));
  }
  return arr;
}

/* -------------------- Service Worker -------------------- */
function registerSW(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
}
