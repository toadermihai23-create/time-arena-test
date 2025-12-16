/*************************************************
 * TimeArena — Penalties System
 * Version: v1.0
 * Philosophy: Corectiv • Proporțional • Non-negociabil
 *************************************************/

export const PENALTY_LEVELS = {

  LEVEL_0: {
    id: 0,
    name: "No Reward",
    emoji: "⚪",
    description: "Nu e pedeapsă. Doar lipsă de câștig.",
    triggers: [
      "uitare",
      "nefinalizare",
      "task făcut pe jumătate",
      "neatenție neintenționată"
    ],
    effects: {
      timeLost: 0,
      timeGained: 0,
      bonusBlocked: false,
      screensBlocked: false,
      streakReset: false
    },
    negotiable: false
  },

  LEVEL_1: {
    id: 1,
    name: "Scratch Damage",
    emoji: "🟡",
    description: "Corecție rapidă, fără dramatism.",
    triggers: [
      "neatenție repetată",
      "întreruperi",
      "lene ușoară",
      "ignorare instrucțiuni"
    ],
    effects: {
      timeLost: [5, 10, 15],
      bonusBlocked: false,
      streakReset: false
    },
    negotiable: false
  },

  LEVEL_2: {
    id: 2,
    name: "Penalty Zone",
    emoji: "🟠",
    description: "Comportamente neplăcute, dar reversibile.",
    triggers: [
      "victimizare",
      "cerșit timp",
      "pasiv-agresiv",
      "evitare ('mă doare')"
    ],
    effects: {
      timeLost: [20, 30, 45],
      bonusBlocked: true,
      streakRisk: true
    },
    negotiable: false
  },

  LEVEL_3: {
    id: 3,
    name: "Daily Ban",
    emoji: "🔴",
    description: "Încălcări serioase. Jocul se oprește o zi.",
    triggers: [
      "minciună clară",
      "dat vina pe alții",
      "manipulare emoțională",
      "refuz școală / igienă"
    ],
    durationDays: 1,
    effects: {
      screensBlocked: true,
      bonusBlocked: true,
      guaranteedTimeLost: true,
      streakReset: true
    },
    negotiable: false
  },

  LEVEL_4: {
    id: 4,
    name: "Cooldown Extins",
    emoji: "⚫",
    description: "Ieșire temporară din arenă.",
    triggers: [
      "repetare Daily Ban",
      "lipsă de respect",
      "sabotaj intenționat",
      "minciună repetată"
    ],
    durationDays: [2, 3],
    effects: {
      screensBlocked: true,
      offlineOnly: true,
      streakReset: true
    },
    negotiable: false
  },

  LEVEL_5: {
    id: 5,
    name: "Season Ban",
    emoji: "🟥",
    description: "Abateri grave. Reset parțial de sezon.",
    triggers: [
      "încălcări grave reguli",
      "lipsă totală cooperare",
      "minciuni majore",
      "comportament distructiv"
    ],
    durationDays: [7, 14],
    effects: {
      screensBlocked: true,
      bonusBlocked: true,
      streakReset: true,
      levelLoss: true
    },
    negotiable: false
  },

  LEVEL_6: {
    id: 6,
    name: "Game Over Temporar",
    emoji: "☠️",
    description: "Reset major al relației cu tehnologia.",
    triggers: [
      "System Breach",
      "telefon ascuns",
      "acces fără permisiune",
      "sfidare totală"
    ],
    durationDays: 30,
    effects: {
      screensBlocked: true,
      timeArenaLite: true,
      levelReset: true,
      streakReset: true
    },
    negotiable: false
  }
};

/*************************************************
 * SYSTEM BREACH — clasificare specială
 *************************************************/
export const SYSTEM_BREACH = {
  name: "System Breach",
  emoji: "🚨",
  autoLevel: 5,
  escalateTo: 6,
  triggers: [
    "telefon ascuns",
    "5-9h peste limită",
    "acces fără permisiune",
    "minciună + ascundere"
  ]
};

/*************************************************
 * RE-ENTRY QUEST — obligatoriu după orice ban
 *************************************************/
export const RE_ENTRY_QUEST = {
  steps: [
    {
      id: 1,
      name: "Raportul Eroului",
      emoji: "🧾",
      required: true,
      questions: [
        "Ce s-a întâmplat?",
        "Ce regulă am încălcat?",
        "Ce aleg diferit data viitoare?"
      ]
    },
    {
      id: 2,
      name: "Misiunea de Reparație",
      emoji: "🔧",
      required: true,
      examples: [
        "curățenie",
        "ajutor extra",
        "gest reparator față de familie"
      ]
    },
    {
      id: 3,
      name: "Zi de Probă",
      emoji: "🟡",
      required: true,
      rules: {
        bonusBlocked: true,
        streakDisabled: true,
        minimalGuaranteedTime: true
      }
    }
  ]
};

/*************************************************
 * PENALTY REDEMPTION — răscumpărare zile
 *************************************************/
export const PENALTY_REDEMPTION = {
  DailyBan: { pointsPerDay: 100, fixedDays: 0 },
  Cooldown: { pointsPerDay: 120, fixedDays: 1 },
  SeasonBan: { pointsPerDay: 150, fixedDays: 3 },
  GameOver: { pointsPerDay: 200, fixedDays: 7 }
};

/*************************************************
 * ESCALATION RULES
 *************************************************/
export const ESCALATION_RULES = {
  repeatSameOffense: "+1 level",
  liePlusOffense: "+2 levels",
  cryingManipulation: "noEffect",
  refuseReport: "banFrozen"
};

/*************************************************
 * STANDARD PHRASE (UI / Parent)
 *************************************************/
export const STANDARD_MESSAGE =
  "Jocul e corect. Nu te pedepsește, dar nici nu negociază.";
