const DEFAULT_CONFIG = {
  friendName: "Bestie",
  message: "You are loved more than words can say. May this year bring you endless joy, peace, and beautiful surprises."
};

const params = new URLSearchParams(window.location.search);
const config = {
  ...DEFAULT_CONFIG,
  friendName: params.get("name") || DEFAULT_CONFIG.friendName,
  message: params.get("message") || DEFAULT_CONFIG.message
};

const friendName = document.getElementById("friendName");
friendName.textContent = config.friendName;

const toast = document.getElementById("toast");
const musicButton = document.getElementById("musicButton");
let toastTimer;
let audioCtx;
let isMusicOn = false;
let melodyTimer = null;
const activeNotes = new Set();
const beatDuration = 0.32;
const birthdayNotes = [
  [392.00, 1], [392.00, 1], [440.00, 2], [392.00, 2], [523.25, 2], [493.88, 4],
  [392.00, 1], [392.00, 1], [440.00, 2], [392.00, 2], [587.33, 2], [523.25, 4],
  [392.00, 1], [392.00, 1], [783.99, 2], [659.25, 2], [523.25, 2], [493.88, 2], [440.00, 4],
  [698.46, 1], [698.46, 1], [659.25, 2], [523.25, 2], [587.33, 2], [523.25, 4]
];
const songDuration = birthdayNotes.reduce((total, [, beats]) => total + beats, 0) * beatDuration;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function ensureAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioCtx) audioCtx = new AudioCtor();
  return audioCtx;
}

async function playBirthdaySong() {
  const ctx = ensureAudioContext();
  if (!ctx) {
    return false;
  }
  if (ctx.state === "suspended") await ctx.resume();

  let elapsedBeats = 0;
  birthdayNotes.forEach(([frequency, beats]) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const startTime = ctx.currentTime + elapsedBeats * beatDuration;
    const duration = beats * beatDuration;
    const noteEnd = startTime + duration * 0.9;

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.045, startTime + 0.035);
    gainNode.gain.setValueAtTime(0.045, noteEnd - 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(noteEnd);
    activeNotes.add(oscillator);
    oscillator.addEventListener("ended", () => activeNotes.delete(oscillator), { once: true });
    elapsedBeats += beats;
  });
  return true;
}

function stopBirthdaySong() {
  activeNotes.forEach((note) => {
    try {
      note.stop();
    } catch (error) {
      if (error.name !== "InvalidStateError") throw error;
    }
  });
  activeNotes.clear();
}

async function toggleMusic() {
  if (!musicButton) return;

  if (isMusicOn) {
    isMusicOn = false;
    musicButton.classList.remove("is-playing");
    musicButton.innerHTML = "♫ <span>Birthday vibes</span>";
    musicButton.setAttribute("aria-pressed", "false");
    clearInterval(melodyTimer);
    stopBirthdaySong();
    showToast("🎵 Happy Birthday song paused.");
    return;
  }

  const ctx = ensureAudioContext();
  if (!ctx) {
    showToast("Your browser does not support audio playback.");
    return;
  }
  try {
    if (ctx.state === "suspended") await ctx.resume();
    await startBirthdayMusic();
    showToast("🎵 Happy Birthday is playing just for you!");
  } catch (error) {
    showToast("Tap Birthday vibes to start the song.");
  }
}

async function startBirthdayMusic() {
  const started = await playBirthdaySong();
  if (!started) return false;
  isMusicOn = true;
  musicButton.classList.add("is-playing");
  musicButton.innerHTML = "❙❙ <span>Birthday vibes</span>";
  musicButton.setAttribute("aria-pressed", "true");
  clearInterval(melodyTimer);
  melodyTimer = setInterval(() => {
    playBirthdaySong().catch(() => {
      clearInterval(melodyTimer);
      isMusicOn = false;
      musicButton.classList.remove("is-playing");
      musicButton.innerHTML = "♫ <span>Birthday vibes</span>";
      musicButton.setAttribute("aria-pressed", "false");
      showToast("Tap Birthday vibes to resume the song.");
    });
  }, songDuration * 1000 + 300);
  return true;
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
  playBirthdaySong();
  showToast(`✨ Wish made for ${config.friendName}! May all your dreams bloom beautifully. 💖`);
});

document.getElementById("surpriseButton").addEventListener("click", () => {
  burstConfetti(120);
  playBirthdaySong();
  showToast(`💗 Reminder, ${config.friendName}: ${config.message}`);
});

musicButton.addEventListener("click", toggleMusic);

function launchBalloons(count = 18) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = ["pink", "lilac", "peach", "blue", "yellow"];
  for (let index = 0; index < count; index++) {
    const balloon = document.createElement("span");
    const duration = 5 + Math.random() * 4;
    balloon.className = `birthday-balloon balloon-${colors[index % colors.length]}`;
    balloon.setAttribute("aria-hidden", "true");
    balloon.style.left = `${4 + Math.random() * 92}%`;
    if (reducedMotion) {
      balloon.classList.add("balloon-still");
      balloon.style.top = `${12 + Math.random() * 68}%`;
    } else {
      balloon.style.animationDuration = `${duration}s`;
      balloon.style.animationDelay = `${Math.random() * 1.8}s`;
    }
    balloon.style.setProperty("--drift", `${(Math.random() - 0.5) * 150}px`);
    balloon.style.setProperty("--spin", `${(Math.random() - 0.5) * 24}deg`);
    document.body.appendChild(balloon);
    setTimeout(() => balloon.remove(), (duration + 2) * 1000);
  }
}

function tryAutoplayBirthdaySong() {
  startBirthdayMusic()
    .then((started) => {
      if (!started) {
        showToast("Tap Birthday vibes to hear the song.");
      }
    })
    .catch(() => {
      showToast("Tap Birthday vibes to hear the song.");
    });
}

const field = document.getElementById("sparkleField");
for (let i = 0; i < 28; i++) {
  const dot = document.createElement("span");
  dot.className = "background-star";
  dot.textContent = Math.random() > 0.5 ? "✦" : "·";
  dot.style.left = `${Math.random() * 100}%`;
  dot.style.top = `${Math.random() * 100}%`;
  dot.style.animationDelay = `${Math.random() * 5}s`;
  field.appendChild(dot);
}

launchBalloons();
tryAutoplayBirthdaySong();
