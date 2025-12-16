let minutes = Number(localStorage.getItem("minutes")) || 0;
let level = Math.floor(minutes / 100) + 1;
let motivation = Math.min(100, 50 + level * 5);
let playMode = localStorage.getItem("playMode") === "true";

document.getElementById("minutes").textContent = minutes;
document.getElementById("level").textContent = level;
document.getElementById("motivation").textContent = motivation + "%";
document.getElementById("playModeStatus").textContent = playMode ? "ON" : "OFF";

/* NAVIGATION */
document.querySelectorAll(".nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(btn.dataset.view).classList.add("active");
  };
});
