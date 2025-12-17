// missions.js — TimeArena demo (LIVE from Google Sheets)
// Suportă rânduri de categorie (fără ID_misiune)

const SHEET_ID = "1avH7qScUDYhSj6xepbEGN6AdsUOQb1JJXSFLTwyauWI";
const TAB = "_Misiuni vs. Penalitati";
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB)}`;

const toInt = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};
const toStr = (v, fallback = "") => (v ?? "").toString().trim() || fallback;

const normPenaltyType = (v) => {
  const s = toStr(v).toLowerCase();
  if (["usor", "ușor", "light"].includes(s)) return "usor";
  if (["mediu", "medium"].includes(s)) return "mediu";
  if (["grav", "hard", "extrem"].includes(s)) return "grav";
  return s || "usor";
};

export async function loadMissionsLive() {
  const res = await fetch(URL, { cache: "no-store" });
  const rows = await res.json();

  let currentCategory = "General";

  return rows
    .map((r) => {
      const id = toStr(r.ID_misiune);
      const name = toStr(r.Nume_misiune);

      // 🔹 RÂND DE CATEGORIE (fără ID, dar cu text)
      if (!id && name) {
        currentCategory = name;
        return null;
      }

      // 🔹 RÂND INVALID
      if (!id) return null;

      const rewardMin = toInt(r.Reward_min, 0);
      let penaltyMin = toInt(r.Penalty_min, 0);
      if (penaltyMin > 0) penaltyMin = -penaltyMin;

      return {
        id,
        category: currentCategory, // 🔥 moștenită din rândul de categorie
        name,
        description: toStr(r.Descriere_misiune),
        type: toStr(r.Tip_misiune, "standard"),
        xp: toInt(r.XP, 0),
        rewardMin,

        penalty: {
          id: toStr(r.ID_penalty),
          name: toStr(r.Nume_penalty),
          description: toStr(r.Descriere_penalty),
          type: normPenaltyType(r.Tip_penalty),
          consequence: toStr(r.Consecinta),
          penaltyMin
        }
      };
    })
    .filter(Boolean);
}
