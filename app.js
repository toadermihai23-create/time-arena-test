let minutes = 0;
const minutesEl = document.getElementById("minutes");

const unlockMissions = [
  { name: "📘 Homework Hero (1h teme)", unlock: true },
  { name: "🌍 Language Slayer (1h limbi)", unlock: true },
  { name: "🕒 Morning Starter (fără dramă)", unlock: true }
];

const winners = [
  { name: "🛡 Order Keeper", value: 15 },
  { name: "🍽 Dish Warrior", value: 15 },
  { name: "🎒 Gear Prep Master", value: 10 },
  { name: "👂 Focus Listener", value: 10 },
  { name: "⚽ Sport Legend", value: 30 }
];

const losers = [
  { name: "😫 Victim Loop", value: -15 },
  { name: "🧢 Sneaky Mode (Minciună)", value: -25 },
  { name: "💥 Rage Outburst", value: -30 },
  { name: "🚫 Homework Reject", value: -30 }
];

const recovery = [
  "🤝 Truth Reset",
  "🙋 Responsibility Accept",
  "🧹 Repair Action",
  "🧘 Calm Cooldown",
  "❤️ Family Reconnect"
];

function renderList(id, items, isPenalty = false) {
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.name || item;
    li.onclick = () => {
      if (!isPenalty && item.value) minutes += item.value;
      if (isPenalty && item.value) minutes = Math.max(0, minutes + item.value);
      update();
    };
    ul.appendChild(li);
  });
}

function update() {
  minutesEl.textContent = minutes;
  localStorage.setItem("minutes", minutes);
}

minutes = Number(localStorage.getItem("minutes")) || 0;
update();

renderList("unlockList", unlockMissions);
renderList("winnerList", winners);
renderList("loserList", losers, true);
renderList("recoveryList", recovery);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
