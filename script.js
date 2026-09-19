const intro = document.getElementById("intro");
const tapPrompt = document.getElementById("tapPrompt");
const nextPage = document.getElementById("nextPage");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let opened = false;

function openDoors() {
  if (opened) return;
  opened = true;

  // Start the door-opening animation
  intro.classList.add("open");

  // Start the music (allowed because this runs from a click)
  if (bgMusic) {
    bgMusic.volume = 0.7;
    bgMusic.play().catch(() => {});
    musicToggle.hidden = false;
    musicToggle.classList.add("playing");
  }

  // Reveal the next page as the doors swing open
  setTimeout(() => {
    nextPage.classList.add("visible");
  }, 2200);

  // Fade out and disable the intro layer once fully open
  setTimeout(() => {
    intro.classList.add("done");
  }, 3600);
}

tapPrompt.addEventListener("click", openDoors);
// Allow tapping anywhere on the doors too
intro.addEventListener("click", openDoors);

// Music play/pause toggle
if (musicToggle) {
  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      musicToggle.classList.add("playing");
    } else {
      bgMusic.pause();
      musicToggle.classList.remove("playing");
    }
  });
}

// Scroll-down button on the first page
const scrollDown = document.getElementById("scrollDown");
if (scrollDown) {
  scrollDown.addEventListener("click", () => {
    const target = document.querySelector(".couple-section");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ================= Wedding details ================= */
// Change this to the real wedding date & time
const WEDDING = new Date("2026-11-11T20:00:00");
const WEDDING_TITLE = "Shubham & Dr Divya – Wedding";
const WEDDING_LOCATION = "Sky Heights Resort, Bathinda, Punjab";

/* ================= Countdown ================= */
const cd = {
  days: document.getElementById("cdDays"),
  hours: document.getElementById("cdHours"),
  mins: document.getElementById("cdMins"),
  secs: document.getElementById("cdSecs"),
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const diff = WEDDING - new Date();
  if (diff <= 0) {
    cd.days.textContent = cd.hours.textContent = cd.mins.textContent = cd.secs.textContent = "00";
    return;
  }
  const s = Math.floor(diff / 1000);
  cd.days.textContent = pad(Math.floor(s / 86400));
  cd.hours.textContent = pad(Math.floor((s % 86400) / 3600));
  cd.mins.textContent = pad(Math.floor((s % 3600) / 60));
  cd.secs.textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

/* ================= Countdown boxes drop in on scroll ================= */
const countdownEl = document.getElementById("countdown");
if (countdownEl && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          countdownEl.classList.add("in-view");
          io.unobserve(countdownEl);
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(countdownEl);
} else if (countdownEl) {
  countdownEl.classList.add("in-view");
}

/* ================= Reveal date text ================= */
const revealDayEl = document.getElementById("revealDay");
const revealDateEl = document.getElementById("revealDate");
if (revealDayEl && revealDateEl) {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  revealDayEl.textContent = days[WEDDING.getDay()];
  revealDateEl.textContent = `${WEDDING.getDate()} ${months[WEDDING.getMonth()]} ${WEDDING.getFullYear()}`;
}

/* ================= Add to calendar ================= */
const calendarBtn = document.getElementById("calendarBtn");
if (calendarBtn) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(WEDDING.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(WEDDING_TITLE) +
    "&dates=" + fmt(WEDDING) + "/" + fmt(end) +
    "&location=" + encodeURIComponent(WEDDING_LOCATION) +
    "&details=" + encodeURIComponent("With love, we invite you to our wedding.");
  calendarBtn.href = url;
  calendarBtn.target = "_blank";
  calendarBtn.rel = "noopener";
}

/* ================= Scratch to reveal ================= */
const canvas = document.getElementById("scratchCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const W = 300;
  const H = 285;
  canvas.width = W;
  canvas.height = H;

  // Paint the maroon "scratch" cover
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#7d1a2e");
  grad.addColorStop(1, "#9a2540");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Sprinkle of tiny gold stars
  ctx.fillStyle = "rgba(240, 210, 150, 0.85)";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = "rgba(255, 245, 230, 0.95)";
  ctx.font = "600 15px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S C R A T C H", W / 2, H / 2 - 12);
  ctx.fillText("T O   R E V E A L", W / 2, H / 2 + 12);

  ctx.globalCompositeOperation = "destination-out";

  let drawing = false;
  let revealed = false;

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return {
      x: (p.clientX - r.left) * (W / r.width),
      y: (p.clientY - r.top) * (H / r.height),
    };
  }

  let lastCheck = 0;
  function scratch(e) {
    if (!drawing) return;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    e.preventDefault();
    const now = Date.now();
    if (now - lastCheck > 200) {
      lastCheck = now;
      checkCleared();
    }
  }

  function checkCleared() {
    if (revealed) return;
    const data = ctx.getImageData(0, 0, W, H).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 4 * 60) {
      if (data[i] === 0) clear++;
    }
    const total = data.length / (4 * 60);
    if (clear / total > 0.22) {
      revealed = true;
      canvas.classList.add("revealed");
      celebrate();
    }
  }

  const start = (e) => { drawing = true; scratch(e); };
  const stop = () => {
    if (!drawing) return;
    drawing = false;
    checkCleared();
  };

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", scratch);
  window.addEventListener("mouseup", stop);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", scratch, { passive: false });
  canvas.addEventListener("touchend", stop);
}

/* ================= Celebration: flowers then balloons ================= */
let celebrated = false;
function celebrate() {
  if (celebrated) return;
  celebrated = true;

  const layer = document.createElement("div");
  layer.className = "celebrate-layer";
  document.body.appendChild(layer);

  const flowers = ["🌸", "🌷", "🌺", "💮", "🏵️", "🌹", "💐", "🌼"];
  const FLOWER_COUNT = 70;
  const FLOWER_PHASE = 3800; // ms of falling flowers before balloons

  // Rain flowers from above
  for (let i = 0; i < FLOWER_COUNT; i++) {
    const f = document.createElement("span");
    f.className = "petal";
    f.textContent = flowers[(Math.random() * flowers.length) | 0];
    f.style.left = Math.random() * 100 + "vw";
    f.style.fontSize = 14 + Math.random() * 22 + "px";
    f.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
    f.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
    f.style.animationDuration = 3 + Math.random() * 2.5 + "s";
    f.style.animationDelay = Math.random() * FLOWER_PHASE + "ms";
    layer.appendChild(f);
  }

  // After the flowers, send up balloons
  setTimeout(() => launchBalloons(layer), FLOWER_PHASE);

  // Clean up once everything has floated away
  setTimeout(() => layer.remove(), FLOWER_PHASE + 9000);
}

function launchBalloons(layer) {
  const colors = [
    ["#f3b9c8", "#e28aa0"],
    ["#f6d38a", "#e0b45a"],
    ["#e7b7d8", "#cf8fbd"],
    ["#f4c6a8", "#e0a07a"],
    ["#cfd8b0", "#aebd8a"],
  ];
  const BALLOON_COUNT = 16;
  for (let i = 0; i < BALLOON_COUNT; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    const c = colors[(Math.random() * colors.length) | 0];
    const size = 22 + Math.random() * 20;
    b.style.left = Math.random() * 100 + "vw";
    b.style.setProperty("--w", size + "px");
    b.style.setProperty("--h", size * 1.25 + "px");
    b.style.setProperty("--drift", (Math.random() * 100 - 50) + "px");
    b.style.background = `radial-gradient(circle at 35% 30%, ${c[0]}, ${c[1]})`;
    b.style.animationDuration = 5 + Math.random() * 3 + "s";
    b.style.animationDelay = Math.random() * 1200 + "ms";
    layer.appendChild(b);
  }
}
