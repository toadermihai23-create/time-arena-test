export const PENALTY_LEVELS = ["Toate", "Ușor", "Mediu", "Grav"];

export const PENALTIES = [
  {
    id: "p-bed-skip",
    title: "Patul Lăsat în Haos",
    desc: "Patul nu e făcut până la prânz.",
    level: "Ușor",
    minutesLost: 45
  },
  {
    id: "p-teeth-skip",
    title: "Neglijare Igienă",
    desc: "Spălat pe dinți ratat (dimineața sau seara).",
    level: "Mediu",
    minutesLost: 60
  },
  {
    id: "p-homework-skip",
    title: "Teme Neatinse",
    desc: "Nu s-au făcut temele / nu există efort real 1h.",
    level: "Grav",
    minutesLost: 120
  },
  {
    id: "p-attitude-boss",
    title: "Boss Fight: Vorbit Urât",
    desc: "Țipete / lipsă respect repetată (după avertizare).",
    level: "Grav",
    minutesLost: 90
  },
  {
    id: "p-sneaky-screen",
    title: "Ecran pe Furiș",
    desc: "Ecran fără acord / minciună legată de ecran.",
    level: "Grav",
    minutesLost: 180
  }
];
