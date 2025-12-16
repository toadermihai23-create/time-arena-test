const unlock = [
  "📘 Homework Hero – 1h teme + pregătire",
  "🌍 Language Slayer – 1h limbi",
  "🕒 Morning Starter – fără dramă"
];

const winners = [
  "🛡 Order Keeper",
  "🍽 Dish Warrior",
  "🎒 Gear Prep Master",
  "👂 Focus Listener",
  "🤝 Truth Teller",
  "🧘 No Drama Skill",
  "⚽ Sport Legend",
  "🌤 Outdoor Adventurer",
  "❤️ Family Buddy"
];

const recovery = [
  "🤝 Truth Reset",
  "🙋 Responsibility Accept",
  "🧹 Repair Action",
  "🧘 Calm Cooldown",
  "❤️ Family Reconnect"
];

function render(id, list) {
  const el = document.getElementById(id);
  list.forEach(m => {
    const div = document.createElement("div");
    div.className = "mission-card";
    div.innerHTML = `<span>${m}</span><span>▶</span>`;
    el.appendChild(div);
  });
}

render("unlockMissions", unlock);
render("winnerMissions", winners);
render("recoveryMissions", recovery);
