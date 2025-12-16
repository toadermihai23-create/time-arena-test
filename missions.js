/* ======================================================
   TimeArena demo — Missions Database (Scalable)
   ====================================================== */

const MISSIONS = {
  unlock: [
    { id:"u_homework", title:"📘 Homework Hero", desc:"1h teme + pregătire pentru toate materiile", tag:"unlock", category:"unlock", points:0, mandatory:true, unlocks:["playstation"] },
    { id:"u_languages", title:"🌍 Language Slayer", desc:"1h limbi străine / zi", tag:"unlock", category:"unlock", points:0, mandatory:true, unlocks:["youtube"] },
    { id:"u_morning", title:"🕒 Morning Starter", desc:"Dimineață fără dramă + plecat devreme", tag:"unlock", category:"unlock", points:0, mandatory:true, unlocks:["daily_play"] },
  ],

  winners: [
    /* 🟢 Responsabilitate & Organizare (10) */
    { id:"w_room", title:"🛡 Order Keeper", desc:"Ordine completă în cameră", tag:"win", category:"responsibility", points:15 },
    { id:"w_tasks", title:"🧹 House Ranger", desc:"Task-uri mărunte (2–3)", tag:"win", category:"responsibility", points:10 },
    { id:"w_dishes", title:"🍽 Dish Warrior", desc:"Spală vasele", tag:"win", category:"responsibility", points:15 },
    { id:"w_trash", title:"🗑 Trash Runner", desc:"Duce gunoiul", tag:"win", category:"responsibility", points:10 },
    { id:"w_clothes", title:"👕 Closet Commander", desc:"Haine la loc + pregătite pentru mâine", tag:"win", category:"responsibility", points:10 },
    { id:"w_bag", title:"🎒 Gear Prep Master", desc:"Ghiozdan pregătit corect", tag:"win", category:"responsibility", points:10 },
    { id:"w_desk", title:"🗂 Desk Architect", desc:"Birou organizat pentru teme", tag:"win", category:"responsibility", points:10 },
    { id:"w_evening", title:"🌙 Evening Guardian", desc:"Rutina de seară la timp", tag:"win", category:"responsibility", points:10 },
    { id:"w_water", title:"💧 Hydration Quest", desc:"Apă + igienă fără negocieri", tag:"win", category:"responsibility", points:10 },
    { id:"w_combo", title:"⭐ Clean Sweep Bonus", desc:"2 taskuri consecutive fără pauze", tag:"win", category:"responsibility", points:20 },

    /* 🟢 Comportament corect (10) */
    { id:"b_listen", title:"👂 Focus Listener", desc:"Ascultă atent 5–10 min", tag:"win", category:"behavior", points:10 },
    { id:"b_respect", title:"🧠 Calm Mode", desc:"Vorbește respectuos", tag:"win", category:"behavior", points:10 },
    { id:"b_limit", title:"🕊 Limit Accepted", desc:"Acceptă o limită fără dramă", tag:"win", category:"behavior", points:15 },
    { id:"b_truth", title:"🤝 Truth Teller", desc:"Spune adevărul", tag:"win", category:"behavior", points:10 },
    { id:"b_no_drama", title:"🧘 No Drama Skill", desc:"Fără victimizare / plâns", tag:"win", category:"behavior", points:15 },
    { id:"b_no_blame", title:"🚫 No Blame Mode", desc:"Nu dă vina pe alții", tag:"win", category:"behavior", points:10 },
    { id:"b_apology", title:"💬 Apology Quest", desc:"Își cere scuze sincer", tag:"win", category:"behavior", points:10 },
    { id:"b_selfcontrol", title:"🎯 Self-Control Boost", desc:"Se oprește din escaladare", tag:"win", category:"behavior", points:15 },
    { id:"b_help", title:"🙋 Ask for Help", desc:"Cere ajutor calm", tag:"win", category:"behavior", points:10 },
    { id:"b_attitude", title:"🏆 Golden Attitude", desc:"Zi fără lipsă de respect", tag:"win", category:"behavior", points:20 },

    /* 🟢 Școală (10) */
    { id:"s_homework_plus", title:"📘 Teme de Platină", desc:"Teme complete + corecte", tag:"win", category:"school", points:20 },
    { id:"s_review", title:"🔁 Review Master", desc:"Recapitulare 15 min", tag:"win", category:"school", points:15 },
    { id:"s_reader", title:"📖 Reader Quest", desc:"Citește 10 pagini", tag:"win", category:"school", points:10 },
    { id:"s_notes", title:"📝 Notes Keeper", desc:"Notează temele corect", tag:"win", category:"school", points:10 },
    { id:"s_hard", title:"🧩 Hard Mission", desc:"Lucrează la materia dificilă", tag:"win", category:"school", points:10 },
    { id:"s_grade", title:"🏅 Grade Upgrade", desc:"Notă bună / progres", tag:"win", category:"school", points:20 },
    { id:"s_pack", title:"🎒 School Ready", desc:"Caiete/manuale ok", tag:"win", category:"school", points:10 },
    { id:"s_language_extra", title:"🌍 Language XP", desc:"Limbi străine extra 10–15 min", tag:"win", category:"school", points:10 },
    { id:"s_focus", title:"🎯 Focus Sprint", desc:"20 min fără distrageri", tag:"win", category:"school", points:10 },
    { id:"s_perfect", title:"🏆 Perfect School Combo", desc:"Teme + recap + ghiozdan", tag:"win", category:"school", points:30 },

    /* 🟢 Activități & sport (10) */
    { id:"a_outdoor", title:"🌤 Outdoor Adventurer", desc:"Ieșit afară 30–60 min", tag:"win", category:"activity", points:20 },
    { id:"a_sport", title:"⚽ Sport Legend", desc:"Sport cu implicare", tag:"win", category:"activity", points:30 },
    { id:"a_walk", title:"🚶 Move Quest", desc:"Plimbare 20–30 min", tag:"win", category:"activity", points:10 },
    { id:"a_stretch", title:"🤸 Flex Master", desc:"Stretching 10 min", tag:"win", category:"activity", points:10 },
    { id:"a_effort", title:"💪 Effort Boost", desc:"Își dă silința", tag:"win", category:"activity", points:10 },
    { id:"a_fear", title:"🧗 Fear Breaker", desc:"Își învinge frica / rușinea", tag:"win", category:"activity", points:10 },
    { id:"a_friends", title:"🛝 Playground Mode", desc:"Joacă afară cu prieteni", tag:"win", category:"activity", points:15 },
    { id:"a_try", title:"🧭 Try Something New", desc:"Încearcă activitate nouă", tag:"win", category:"activity", points:15 },
    { id:"a_family", title:"🚴 Family Activity", desc:"Mișcare cu părinții", tag:"win", category:"activity", points:10 },
    { id:"a_combo", title:"🔥 Full Activity Combo", desc:"Afara + sport/mișcare", tag:"win", category:"activity", points:25 },

    /* 🟢 Familie & relație (10) */
    { id:"f_time", title:"❤️ Family Buddy", desc:"10–20 min cu familia fără telefon", tag:"win", category:"family", points:10 },
    { id:"f_fun", title:"😂 Fun Maker", desc:"Glumește + atmosferă bună", tag:"win", category:"family", points:10 },
    { id:"f_dinner", title:"🍽 Dinner Paladin", desc:"Cină cu atitudine bună", tag:"win", category:"family", points:10 },
    { id:"f_talk", title:"💬 Talk Mode ON", desc:"Povestește ziua lui", tag:"win", category:"family", points:10 },
    { id:"f_help", title:"🙌 Helpful Spirit", desc:"Ajută spontan", tag:"win", category:"family", points:10 },
    { id:"f_empathy", title:"🧸 Empathy Boost", desc:"Gest de empatie", tag:"win", category:"family", points:10 },
    { id:"f_feedback", title:"🧠 Feedback Accepted", desc:"Primește feedback fără dramă", tag:"win", category:"family", points:10 },
    { id:"f_zero", title:"🌟 Zero Conflict Day", desc:"Zi fără conflict major", tag:"win", category:"family", points:20 },
    { id:"f_game", title:"🎲 Game Night Hero", desc:"Joc de familie 15–30 min", tag:"win", category:"family", points:10 },
    { id:"f_connect", title:"💎 Connection Master", desc:"Conectare reală (calm + respect)", tag:"win", category:"family", points:20 },
  ],

  bonus: [
    /* 5 per categorie (doar bonus, fără penalități) */
    { id:"bx_r1", title:"⭐ Voluntary Helper", desc:"Ajută fără să fie rugat", tag:"bonus", category:"responsibility", points:10 },
    { id:"bx_r2", title:"⭐ Upgrade Home", desc:"Îmbunătățește ceva prin casă", tag:"bonus", category:"responsibility", points:10 },
    { id:"bx_r3", title:"⭐ Remember Quest", desc:"Își amintește singur ce are de făcut", tag:"bonus", category:"responsibility", points:10 },
    { id:"bx_r4", title:"⭐ Extra Task", desc:"Își alege un task extra", tag:"bonus", category:"responsibility", points:10 },
    { id:"bx_r5", title:"⭐ Fast Finish", desc:"Termină rapid fără protest", tag:"bonus", category:"responsibility", points:10 },

    { id:"bx_b1", title:"💎 Calm Choice", desc:"Se liniștește singur", tag:"bonus", category:"behavior", points:10 },
    { id:"bx_b2", title:"💎 Empathy Move", desc:"Face un gest de empatie", tag:"bonus", category:"behavior", points:10 },
    { id:"bx_b3", title:"💎 Honest Moment", desc:"Spune adevărul imediat", tag:"bonus", category:"behavior", points:10 },
    { id:"bx_b4", title:"💎 Respect Under Stress", desc:"Respect chiar când e frustrat", tag:"bonus", category:"behavior", points:15 },
    { id:"bx_b5", title:"💎 Mature Talk", desc:"Vorbește matur despre o problemă", tag:"bonus", category:"behavior", points:15 },

    { id:"bx_s1", title:"📚 Extra Exercise", desc:"Exercițiu suplimentar", tag:"bonus", category:"school", points:10 },
    { id:"bx_s2", title:"📚 Neat Notebook", desc:"Caiete aranjate", tag:"bonus", category:"school", points:10 },
    { id:"bx_s3", title:"📚 5 New Words", desc:"5 cuvinte noi", tag:"bonus", category:"school", points:10 },
    { id:"bx_s4", title:"📚 Mini Project", desc:"Proiect mic singur", tag:"bonus", category:"school", points:15 },
    { id:"bx_s5", title:"📚 Teach Back", desc:"Explică ce a învățat", tag:"bonus", category:"school", points:15 },

    { id:"bx_a1", title:"🏃 Mini Workout", desc:"10 min mișcare acasă", tag:"bonus", category:"activity", points:10 },
    { id:"bx_a2", title:"🏃 Stretch+Breath", desc:"Stretch + respirație", tag:"bonus", category:"activity", points:10 },
    { id:"bx_a3", title:"🏃 New Sport Try", desc:"Încearcă ceva nou", tag:"bonus", category:"activity", points:15 },
    { id:"bx_a4", title:"🏃 Outdoor Bonus", desc:"Extra 15 min afară", tag:"bonus", category:"activity", points:10 },
    { id:"bx_a5", title:"🏃 Creative Move", desc:"Joc activ creativ", tag:"bonus", category:"activity", points:10 },

    { id:"bx_f1", title:"🫶 Surprise Nice", desc:"Surpriză frumoasă", tag:"bonus", category:"family", points:10 },
    { id:"bx_f2", title:"🫶 Help Without Ask", desc:"Ajută fără să fie întrebat", tag:"bonus", category:"family", points:10 },
    { id:"bx_f3", title:"🫶 Deep Talk", desc:"10 min discuție reală", tag:"bonus", category:"family", points:15 },
    { id:"bx_f4", title:"🫶 Appreciation", desc:"Apreciază verbal pe cineva", tag:"bonus", category:"family", points:10 },
    { id:"bx_f5", title:"🫶 Cook Assist", desc:"Ajută la gătit", tag:"bonus", category:"family", points:10 },

    /* SUPER BONUS SPECIAL */
    { id:"sb1", title:"🌟 Zero Drama Day", desc:"Zi fără victimizare / plâns strategic", tag:"bonus", category:"special", points:20 },
    { id:"sb2", title:"🌟 Zero Lies Day", desc:"Zi fără minciuni", tag:"bonus", category:"special", points:20 },
    { id:"sb3", title:"🌟 Zero Excuses Day", desc:"Zi fără “mă doare” ca scuză", tag:"bonus", category:"special", points:20 },
    { id:"sb4", title:"🌟 Hero of the Day", desc:"Zi completă: obligatorii + comportament ok", tag:"bonus", category:"special", points:30 },
    { id:"sb5", title:"🌟 Perfect Day Combo", desc:"Obligatorii + 2 winners + 1 family", tag:"bonus", category:"special", points:30 },
  ],

  penalties: [
    { id:"p_victim", title:"😫 Victim Loop", desc:"Victimizare / dramatizare", tag:"damage", category:"behavior", damage:15, blockBonus:true },
    { id:"p_cry", title:"😭 Cry Exploit", desc:"Plâns strategic pentru a obține", tag:"damage", category:"behavior", damage:20, blockBonus:true },
    { id:"p_lie", title:"🧢 Sneaky Mode", desc:"Minciună / păcăleală", tag:"damage", category:"behavior", damage:25, blockBonus:true },
    { id:"p_blame", title:"👿 Blame Shift", desc:"Dă vina pe alții", tag:"damage", category:"behavior", damage:15, blockBonus:true },
    { id:"p_disrespect", title:"🚫 Disrespect Strike", desc:"Ton urât / lipsă de respect", tag:"damage", category:"behavior", damage:20, blockBonus:true },
    { id:"p_rage", title:"💥 Rage Outburst", desc:"Criză intensă", tag:"damage", category:"behavior", damage:30, blockPlay:true },
    { id:"p_cheat", title:"🎭 System Cheat", desc:"Trișare / fentare sistem", tag:"damage", category:"behavior", damage:30, blockPlay:true },
    { id:"p_refuse_homework", title:"❌ Homework Reject", desc:"Refuz teme", tag:"damage", category:"school", damage:30, blockBonus:true },
    { id:"p_refuse_lang", title:"❌ Language Reject", desc:"Refuz limbi", tag:"damage", category:"school", damage:30, blockBonus:true },
    { id:"p_fakepain", title:"🩹 Pain Excuse Exploit", desc:"“mă doare” ca evitare", tag:"damage", category:"behavior", damage:20, blockBonus:true },
    { id:"p_public", title:"🧨 Public Meltdown", desc:"Scandal în public", tag:"damage", category:"behavior", damage:30, blockPlay:true },
    { id:"p_destroy", title:"🧨 Destruction", desc:"Aruncat/distrus obiecte", tag:"damage", category:"behavior", damage:30, blockPlay:true },
  ],

  recovery: [
    { id:"r_truth", title:"🤝 Truth Reset", desc:"Spune adevărul complet", tag:"recovery", category:"recovery" },
    { id:"r_accept", title:"🙋 Responsibility Accept", desc:"Își asumă greșeala fără scuze", tag:"recovery", category:"recovery" },
    { id:"r_repair", title:"🧹 Repair Action", desc:"Repară sau ajută concret (task)", tag:"recovery", category:"recovery" },
    { id:"r_calm", title:"🧘 Calm Cooldown", desc:"20 min calm fără țipete", tag:"recovery", category:"recovery" },
    { id:"r_family", title:"❤️ Family Reconnect", desc:"10 min conectare calmă", tag:"recovery", category:"recovery" },
  ],

  shop: [
    { id:"shop_ps_30", title:"🎮 +30 min PlayStation", desc:"Recompensă directă", cost:30, effect:{addMinutes:30} },
    { id:"shop_ps_60", title:"🎮 +60 min PlayStation", desc:"Recompensă mare", cost:60, effect:{addMinutes:60} },
    { id:"shop_yt_20", title:"📺 +20 min YouTube/Desene", desc:"Extra video time", cost:20, effect:{addMinutes:20} },
    { id:"shop_family", title:"🍦 Family Treat", desc:"Mini-recompensă în familie", cost:40, effect:{badge:"Family Treat"} },
    { id:"shop_skin", title:"✨ Badge Cosmetic", desc:"Titlu special (cosmetic)", cost:25, effect:{badge:"Arena Hero"} },
  ],
};

window.MISSIONS = MISSIONS;
