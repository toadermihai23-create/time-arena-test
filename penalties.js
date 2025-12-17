// penalties.js — TimeArena demo (LIVE catalog)
const SHEET_ID = "1wBXFPcdip_mtGvhv5moAAMMNjtJuVFrSZfxcBPM-w_c";
const TAB = "_Penalitati";
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB)}`;

const toInt = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};
const toStr = (v, fallback = "") => (v ?? "").toString().trim() || fallback;

export async function loadPenaltiesLive() {
  const res = await fetch(URL, { cache: "no-store" });
  const rows = await res.json();

  // Coloane recomandate în sheet: Nivel, Nume, Emoji, Când, Efect, Durata, Ecrane, BonusTime, Streak, ZileFixe, PunctePeZi, ReEntry
  return rows
    .filter(r => toStr(r.Nivel) !== "")
    .map(r => ({
      level: toInt(r.Nivel, 0),
      name: toStr(r.Nume),
      emoji: toStr(r.Emoji),
      when: toStr(r["Când"] || r.Cand),
      effect: toStr(r.Efect),
      duration: toStr(r.Durata),

      screens: toStr(r.Ecrane),
      bonusTime: toStr(r.BonusTime),
      streak: toStr(r.Streak),

      fixedDays: toInt(r.ZileFixe, 0),
      pointsPerDay: toInt(r.PunctePeZi, 0),
      reEntry: toStr(r.ReEntry)
    }));
}
