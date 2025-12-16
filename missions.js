export const MISSION_CATEGORIES = [
  "Toate",
  "Responsabilitate",
  "Comportament",
  "Școală",
  "Sport",
  "Familie",
  "Bonus"
];

// minute = timp câștigat
// xp = progres nivel
export const MISSIONS = [
  {
    id: "m-bed-first",
    title: "Gardianul Patului",
    desc: "Patul făcut imediat după trezire (fără negocieri).",
    category: "Responsabilitate",
    minutes: 5,
    xp: 10,
    dailyLimit: 1
  },
  {
    id: "m-teeth-spark",
    title: "Dinți Sclipitori",
    desc: "Spălat pe dinți corect (2 minute) dimineața + seara.",
    category: "Responsabilitate",
    minutes: 5,
    xp: 10,
    dailyLimit: 2
  },
  {
    id: "m-homework-hero",
    title: "Eroul Temelor",
    desc: "1h teme + verificare: caiet, exerciții, pregătire pentru mâine.",
    category: "Școală",
    minutes: 20,
    xp: 25,
    dailyLimit: 1
  },
  {
    id: "m-language-master",
    title: "Maestrul Limbilor",
    desc: "1h limbă străină (lecție + exercițiu + recapitulare).",
    category: "Școală",
    minutes: 15,
    xp: 25,
    dailyLimit: 1
  },
  {
    id: "m-ready-school",
    title: "Pregătit de Școală",
    desc: "Ghiozdan pregătit + haine + alarmă setată (fără grabă dimineața).",
    category: "Școală",
    minutes: 10,
    xp: 15,
    dailyLimit: 1
  },
  {
    id: "m-sport-boost",
    title: "Boost de Energie",
    desc: "30 min mișcare (sport / alergare / exerciții / plimbare activă).",
    category: "Sport",
    minutes: 10,
    xp: 20,
    dailyLimit: 1
  },
  {
    id: "m-family-ally",
    title: "Aliatul Familiei",
    desc: "Ajutor real: strâns masă / gunoi / ordonat fără să ți se ceară.",
    category: "Familie",
    minutes: 10,
    xp: 15,
    dailyLimit: 2
  },
  {
    id: "m-good-attitude",
    title: "Calm ca un Ninja",
    desc: "Îți corectezi tonul imediat când ți se atrage atenția.",
    category: "Comportament",
    minutes: 5,
    xp: 10,
    dailyLimit: 3
  },
  {
    id: "m-youtube-20",
    title: "YouTube +20",
    desc: "Bonus special: câștigi 20 min YouTube/Desene (doar dacă ai făcut obligatorii).",
    category: "Bonus",
    minutes: 20,
    xp: 10,
    dailyLimit: 1
  }
];
