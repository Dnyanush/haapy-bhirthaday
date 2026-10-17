// Personalise the page by changing FRIEND_NAME below.
const FRIEND_NAME = "Bestie";
const friendName = document.getElementById("friendName");
friendName.textContent = FRIEND_NAME;

const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function burstConfetti(count = 65) {
  const symbols = ["✦", "✧", "♥", "♡", "✿", "★"];
  for (let i = 0; i < count; i++) {
    const item = document.createElement("span");
    item.className = "sparkle";
    item.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    item.style.left = `${35 + Math.random() * 30}%`;
    item.style.top = `${35 + Math.random() * 25}%`;
    item.style.color = ["#ff9dcc", "#d0b5ff", "#ffe7a4", "#ffffff"][Math.floor(Math.random() * 4)];
    item.style.setProperty("--dx", `${(Math.random() - 0.5) * 620}px`);
    item.style.setProperty("--dy", `${(Math.random() - 0.7) * 520}px`);
    item.style.fontSize = `${12 + Math.random() * 20}px`;
    document.body.appendChild(item);
    setTimeout(() => item.remove(), 1400);
  }
}

document.getElementById("wishButton").addEventListener("click", () => {
  burstConfetti(90);
  showToast("✨ Wish made! May every beautiful thing find its way to you. 💖");
});

document.getElementById("surpriseButton").addEventListener("click", () => {
  burstConfetti(120);
  showToast(`💗 Reminder, ${FRIEND_NAME}: you are loved more than words can say!`);
});

document.getElementById("musicButton").addEventListener("click", () => {
  showToast("🎵 Add your favourite birthday song here to make this page extra special!");
});

// Tiny background sparkle details.
const field = document.getElementById("sparkleField");
for (let i = 0; i < 28; i++) {
  const dot = document.createElement("span");
  dot.className = "background-star";
  dot.textContent = Math.random() > .5 ? "✦" : "·";
  dot.style.left = `${Math.random() * 100}%`;
  dot.style.top = `${Math.random() * 100}%`;
  dot.style.animationDelay = `${Math.random() * 5}s`;
  field.appendChild(dot);
}
