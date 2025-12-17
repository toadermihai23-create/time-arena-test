// rules.js — TimeArena demo (LIVE rules)
const SHEET_ID = "1wBXFPcdip_mtGvhv5moAAMMNjtJuVFrSZfxcBPM-w_c";
const TAB = "_Rules";
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB)}`;

const toStr = (v, fallback = "") => (v ?? "").toString().trim() || fallback;
const toInt = (v, fallback = 999) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};
const toBool = (v, fallback = true) => {
  const s = toStr(v).toLowerCase();
  if (["false","0","nu","no"].includes(s)) return false;
  if (["true","1","da","yes"].includes(s)) return true;
  return fallback;
};

export async function loadRulesLive() {
  const res = await fetch(URL, { cache: "no-store" });
  const rows = await res.json();

  // Coloane recomandate: ID, Titlu, Regula, Tip, Ordine, Activ
  return rows
    .filter(r => toStr(r.Regula))
    .filter(r => toBool(r.Activ, true))
    .map(r => ({
      id: toStr(r.ID),
      title: toStr(r.Titlu),
      text: toStr(r.Regula),
      type: toStr(r.Tip, "secundar"),
      order: toInt(r.Ordine, 999)
    }))
    .sort((a,b) => a.order - b.order);
}
