const DEFAULT_CONFIG = {
  friendName: "Khushaboo ji",
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
const birthdayMusic = document.getElementById("birthdayMusic");
const blowButton = document.getElementById("blowButton");
const cakeScene = document.querySelector(".cake-scene");
const birthdayCake = document.getElementById("birthdayCake");
const wishHint = document.getElementById("wishHint");
const candles = Array.from(cakeScene.querySelectorAll(".candle"));
const candleBirthdayDialog = document.getElementById("candleBirthdayDialog");
const closeCandleBirthdayButton = document.getElementById("closeCandleBirthdayButton");
const surpriseDialog = document.getElementById("surpriseDialog");
const surpriseMessage = document.getElementById("surpriseMessage");
const giftCodeDialog = document.getElementById("giftCodeDialog");
const giftCode = document.querySelector(".gift-code").textContent.trim();
const copyGiftCodeButton = document.getElementById("copyGiftCodeButton");
const copyGiftCodeLabel = document.getElementById("copyGiftCodeLabel");
let toastTimer;
let isMusicOn = false;
let surpriseIndex = -1;
let autoplayFallbackRegistered = false;
let cakeCutUnlocked = false;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function stopBirthdaySong() {
  birthdayMusic.pause();
  birthdayMusic.currentTime = 0;
}

async function toggleMusic() {
  if (!musicButton) return;

  if (isMusicOn) {
    isMusicOn = false;
    updateMusicButtonForPausedState();
    stopBirthdaySong();
    showToast("🎵 Happy Birthday song paused.");
    return;
  }

  try {
    await startBirthdayMusic();
    showToast("🎵 Happy Birthday is playing just for you!");
  } catch {
    showToast(birthdayMusic.error ? "Birthday music couldn't load. Check your internet connection." : "Tap Birthday vibes to start the song.");
  }
}

async function startBirthdayMusic() {
  await birthdayMusic.play();
  isMusicOn = true;
  musicButton.classList.add("is-playing");
  musicButton.innerHTML = "❙❙ <span>Birthday vibes</span>";
  musicButton.setAttribute("aria-pressed", "true");
  musicButton.setAttribute("aria-label", "Pause birthday music");
  return true;
}

function updateMusicButtonForPausedState() {
  musicButton.classList.remove("is-playing");
  musicButton.innerHTML = "♫ <span>Birthday vibes</span>";
  musicButton.setAttribute("aria-pressed", "false");
  musicButton.setAttribute("aria-label", "Play birthday music");
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

function showerBirthdayTreats(origin) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const treats = ["🍬", "🍫", "🍭", "⭐", "✨", "💖", "🎉"];
  const bounds = origin.getBoundingClientRect();
  const originX = bounds.left + bounds.width / 2;
  const originY = bounds.top + bounds.height / 2;

  for (let index = 0; index < 28; index++) {
    const treat = document.createElement("span");
    treat.className = "birthday-treat";
    treat.setAttribute("aria-hidden", "true");
    treat.textContent = treats[Math.floor(Math.random() * treats.length)];
    treat.style.left = `${originX}px`;
    treat.style.top = `${originY}px`;
    treat.style.setProperty("--treat-x", `${(Math.random() - 0.5) * Math.min(window.innerWidth * 0.9, 620)}px`);
    treat.style.setProperty("--treat-y", `${(Math.random() - 0.58) * 440}px`);
    treat.style.setProperty("--treat-spin", `${(Math.random() - 0.5) * 540}deg`);
    treat.style.animationDelay = `${Math.random() * 180}ms`;
    document.body.appendChild(treat);
    setTimeout(() => treat.remove(), 2700);
  }
}

function updateCandleControls() {
  const extinguishedCount = candles.filter((candle) => candle.classList.contains("is-out")).length;
  const allCandlesAreOut = extinguishedCount === candles.length;

  cakeScene.classList.toggle("candles-out", allCandlesAreOut);
  blowButton.setAttribute("aria-pressed", String(allCandlesAreOut));
  blowButton.querySelector("span").textContent = allCandlesAreOut
    ? "Relight the candles"
    : extinguishedCount > 0
      ? "Blow out remaining candles"
      : "Blow out the candles";
}

function setCandleExtinguished(candle, extinguished) {
  candle.classList.toggle("is-out", extinguished);
  candle.setAttribute("aria-pressed", String(extinguished));
  candle.setAttribute("aria-label", `${extinguished ? "Relight" : "Blow out"} ${candle.dataset.candleName}`);
  updateCandleControls();
}

function celebrateAllCandlesOut() {
  burstConfetti(75);
  candleBirthdayDialog.showModal();
}

function cutBirthdayCake() {
  if (!cakeCutUnlocked) {
    showToast("First put out the candles and press Thank you!");
    return;
  }
  if (birthdayCake.classList.contains("is-cut")) return;

  birthdayCake.style.removeProperty("transform");
  cakeScene.classList.remove("cake-cut-ready");
  cakeScene.classList.add("cake-cut-complete");
  birthdayCake.classList.add("is-cut");
  birthdayCake.setAttribute("aria-label", "Birthday cake has been cut.");
  birthdayCake.setAttribute("aria-pressed", "true");
  burstConfetti(65);
  showToast(`🎂 The cake is cut! Happy Birthday, ${config.friendName}!`);
}

birthdayCake.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest(".candle")) return;
  cutBirthdayCake();
});
birthdayCake.addEventListener("keydown", (event) => {
  if (event.target !== birthdayCake || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  cutBirthdayCake();
});

cakeScene.addEventListener("pointermove", (event) => {
  if (prefersReducedMotion || event.pointerType === "touch" || birthdayCake.classList.contains("is-cut")) return;

  const bounds = cakeScene.getBoundingClientRect();
  const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
  const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
  birthdayCake.style.transform = `rotateX(${7 - vertical * 8}deg) rotateY(${-8 + horizontal * 18}deg) translateY(-4px)`;
});
cakeScene.addEventListener("pointerleave", () => birthdayCake.style.removeProperty("transform"));

candles.forEach((candle, index) => {
  candle.dataset.candleName = `candle ${index + 1}`;
  candle.addEventListener("click", () => {
    const extinguished = !candle.classList.contains("is-out");
    setCandleExtinguished(candle, extinguished);
    if (extinguished && candles.every((item) => item.classList.contains("is-out"))) {
      celebrateAllCandlesOut();
    } else {
      showToast(extinguished ? "One candle out! Tap the others to make your wish." : "Your candle is glowing again!");
    }
  });
});

document.getElementById("wishButton").addEventListener("click", (event) => {
  burstConfetti(90);
  showerBirthdayTreats(event.currentTarget);
  wishHint.textContent = `Your wish is on its way, ${config.friendName}! ✨`;
  wishHint.classList.remove("wish-made");
  void wishHint.offsetWidth;
  wishHint.classList.add("wish-made");
  startBirthdayMusic().catch(() => {
    showToast(birthdayMusic.error ? "Birthday music couldn't load. Check your internet connection." : "Tap Birthday vibes to start the song.");
  });
  showToast(`✨ Wish made for ${config.friendName}! May all your dreams bloom beautifully. 💖`);
});

blowButton.addEventListener("click", () => {
  const allCandlesAreOut = candles.every((candle) => candle.classList.contains("is-out"));
  candles.forEach((candle) => setCandleExtinguished(candle, !allCandlesAreOut));
  if (!allCandlesAreOut) {
    celebrateAllCandlesOut();
  }
});

function closeCandleBirthdayDialog() {
  candleBirthdayDialog.close();
}

document.getElementById("closeCandleBirthday").addEventListener("click", closeCandleBirthdayDialog);
closeCandleBirthdayButton.addEventListener("click", () => {
  closeCandleBirthdayDialog();
  cakeCutUnlocked = true;
  cakeScene.classList.add("cake-cut-ready");
  birthdayCake.classList.add("cake-cut-unlocked");
  birthdayCake.setAttribute("tabindex", "0");
  birthdayCake.setAttribute("aria-label", "Cut the birthday cake. Press Enter or Space, or click the cake.");
  wishHint.textContent = "Now click the cake to cut it! 🎂";
  showToast("The cake is ready! Click it to cut the first slice.");
});
candleBirthdayDialog.addEventListener("click", (event) => {
  if (event.target === candleBirthdayDialog) closeCandleBirthdayDialog();
});

const surprises = [
  `💗 ${config.message}`,
  `🌷 ${config.friendName}, you make ordinary days feel like something worth celebrating.`,
  `✨ A little reminder: you deserve every kind thing you give to everyone else.`,
  `🎂 New year, new adventures—and your best moments are still ahead.`,
  `🫶 No matter how far life takes us, you’ll always have your best friend in your corner.`
];

function revealSurprise() {
  let nextIndex = Math.floor(Math.random() * surprises.length);
  if (surprises.length > 1 && nextIndex === surpriseIndex) {
    nextIndex = (nextIndex + 1) % surprises.length;
  }
  surpriseIndex = nextIndex;
  surpriseMessage.textContent = surprises[surpriseIndex];
  burstConfetti(85);
  launchBalloons(8);
}

document.getElementById("anotherSurprise").addEventListener("click", revealSurprise);
document.getElementById("closeSurprise").addEventListener("click", () => surpriseDialog.close());
surpriseDialog.addEventListener("click", (event) => {
  if (event.target === surpriseDialog) surpriseDialog.close();
});

const openGiftButton = document.getElementById("openGiftButton");
openGiftButton.addEventListener("click", () => {
  if (openGiftButton.classList.contains("is-opening")) return;
  if (openGiftButton.classList.contains("is-open")) {
    giftCodeDialog.showModal();
    return;
  }

  const openingDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 760;
  openGiftButton.classList.add("is-opening");
  openGiftButton.disabled = true;
  window.setTimeout(() => {
    openGiftButton.classList.remove("is-opening");
    openGiftButton.classList.add("is-open");
    openGiftButton.disabled = false;
    giftCodeDialog.showModal();
    burstConfetti(45);
  }, openingDuration);
});
document.getElementById("closeGiftCode").addEventListener("click", () => giftCodeDialog.close());
giftCodeDialog.addEventListener("click", (event) => {
  if (event.target === giftCodeDialog) giftCodeDialog.close();
});
copyGiftCodeButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(giftCode);
    copyGiftCodeLabel.textContent = "Copied!";
    copyGiftCodeButton.classList.add("is-copied");
    showToast("Gift code copied to clipboard!");
    window.setTimeout(() => {
      copyGiftCodeLabel.textContent = "Copy gift code";
      copyGiftCodeButton.classList.remove("is-copied");
    }, 2200);
  } catch {
    showToast("Couldn't copy automatically. Please select and copy the gift code.");
  }
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
    balloon.style.width = `${34 + Math.random() * 20}px`;
    balloon.style.height = `${46 + Math.random() * 24}px`;
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
  startBirthdayMusic().catch(() => {
    if (birthdayMusic.error) {
      showToast("Birthday music couldn't load. Check your internet connection.");
      return;
    }

    showToast("Tap or press any key to start the birthday music.");
    registerAutoplayFallback();
  });
}

function registerAutoplayFallback() {
  if (autoplayFallbackRegistered) return;
  autoplayFallbackRegistered = true;

  const startAfterGesture = (event) => {
    if (event.target instanceof Element && event.target.closest("#musicButton")) return;
    window.removeEventListener("pointerdown", startAfterGesture);
    window.removeEventListener("keydown", startAfterGesture);
    startBirthdayMusic().catch(() => {
      showToast(birthdayMusic.error ? "Birthday music couldn't load. Check your internet connection." : "Tap Birthday vibes to hear the song.");
    });
  };

  window.addEventListener("pointerdown", startAfterGesture);
  window.addEventListener("keydown", startAfterGesture);
}

function startAnimatedBackdrop() {
  const canvas = document.getElementById("birthdayBackdrop");
  const context = canvas.getContext("2d");
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const starCount = window.innerWidth < 650 ? 36 : 65;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.4 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 1.2,
    drift: (Math.random() - 0.5) * 0.000035,
    hue: Math.random() > 0.55 ? 325 : 265
  }));
  const shootingStars = [];
  let animationFrame;
  let lastFrameTime = 0;
  let lastShootingStar = 0;
  let width = 0;
  let height = 0;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw(0, false);
  }

  function draw(time, animate = true) {
    context.clearRect(0, 0, width, height);

    const glowX = width * (0.25 + Math.sin(time * 0.00018) * 0.12);
    const glowY = height * (0.24 + Math.cos(time * 0.00015) * 0.08);
    const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.78);
    glow.addColorStop(0, "rgba(155, 74, 190, 0.13)");
    glow.addColorStop(0.52, "rgba(91, 56, 151, 0.06)");
    glow.addColorStop(1, "rgba(25, 16, 48, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    const auroraShift = Math.sin(time * 0.00022) * width * 0.08;
    const aurora = context.createLinearGradient(0, height * 0.12, width, height * 0.62);
    aurora.addColorStop(0, "rgba(80, 198, 208, 0)");
    aurora.addColorStop(0.35, "rgba(157, 105, 226, 0.035)");
    aurora.addColorStop(0.58, "rgba(255, 116, 188, 0.045)");
    aurora.addColorStop(1, "rgba(80, 198, 208, 0)");
    context.beginPath();
    context.moveTo(-width * 0.1, height * 0.37);
    context.bezierCurveTo(width * 0.25 + auroraShift, height * 0.14, width * 0.53 - auroraShift, height * 0.58, width * 1.1, height * 0.25);
    context.lineTo(width * 1.1, height * 0.57);
    context.bezierCurveTo(width * 0.53 - auroraShift, height * 0.86, width * 0.25 + auroraShift, height * 0.42, -width * 0.1, height * 0.68);
    context.closePath();
    context.fillStyle = aurora;
    context.fill();

    for (const star of stars) {
      if (animate) {
        star.x += star.drift;
        if (star.x < -0.02) star.x = 1.02;
        if (star.x > 1.02) star.x = -0.02;
      }
      const twinkle = animate ? 0.48 + Math.sin(time * 0.001 * star.speed + star.phase) * 0.34 : 0.72;
      const x = star.x * width;
      const y = star.y * height;
      context.beginPath();
      context.arc(x, y, star.radius * (0.8 + twinkle * 0.45), 0, Math.PI * 2);
      context.fillStyle = `hsla(${star.hue}, 95%, 88%, ${twinkle})`;
      context.fill();
      if (star.radius > 1.45) {
        context.beginPath();
        context.arc(x, y, star.radius * 4.5, 0, Math.PI * 2);
        context.fillStyle = `hsla(${star.hue}, 100%, 78%, ${twinkle * 0.075})`;
        context.fill();
      }
    }

    if (animate && time - lastShootingStar > 2200 + Math.random() * 2800 && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.35,
        vx: 5 + Math.random() * 5,
        vy: 2 + Math.random() * 3,
        life: 0,
        duration: 38 + Math.random() * 24
      });
      lastShootingStar = time;
    }

    for (let index = shootingStars.length - 1; index >= 0; index--) {
      const shootingStar = shootingStars[index];
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life += 1;
      const opacity = Math.sin(Math.PI * shootingStar.life / shootingStar.duration);
      const tail = context.createLinearGradient(
        shootingStar.x - shootingStar.vx * 11,
        shootingStar.y - shootingStar.vy * 11,
        shootingStar.x,
        shootingStar.y
      );
      tail.addColorStop(0, "rgba(255, 190, 230, 0)");
      tail.addColorStop(1, `rgba(255, 226, 249, ${opacity})`);
      context.beginPath();
      context.moveTo(shootingStar.x - shootingStar.vx * 11, shootingStar.y - shootingStar.vy * 11);
      context.lineTo(shootingStar.x, shootingStar.y);
      context.strokeStyle = tail;
      context.lineWidth = 2;
      context.stroke();
      if (shootingStar.life >= shootingStar.duration) shootingStars.splice(index, 1);
    }
  }

  function animate(time) {
    if (time - lastFrameTime >= 1000 / 30) {
      draw(time);
      lastFrameTime = time;
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  if (!reducedMotion) {
    animationFrame = window.requestAnimationFrame(animate);
    document.addEventListener("visibilitychange", () => {
      window.cancelAnimationFrame(animationFrame);
      if (!document.hidden) animationFrame = window.requestAnimationFrame(animate);
    });
  }
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

const revealItems = document.querySelectorAll(".reveal-on-scroll");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

startAnimatedBackdrop();
launchBalloons(prefersReducedMotion ? 6 : 10);
if (!prefersReducedMotion) {
  window.setInterval(() => {
    if (!document.hidden) launchBalloons(3);
  }, 10000);
}
tryAutoplayBirthdaySong();
