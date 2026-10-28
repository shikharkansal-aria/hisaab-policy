// Hero background drawn live: a soft glow behind the day ring, two light streaks
// orbiting it (half a turn every 8 s) and drifting dust. No video, no libraries.
const hero = document.querySelector(".hx");
const canvas = document.getElementById("hxbg");
const ringEl = document.querySelector(".ring");
const ctx = canvas.getContext("2d");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MINT = "91,227,173";

let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, r = 0, glow, dot, parts = [];

function sprite(size, stops) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function layout() {
  dpr = Math.min(devicePixelRatio || 1, 1.5);
  w = hero.clientWidth; h = hero.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const hb = hero.getBoundingClientRect(), rb = ringEl.getBoundingClientRect();
  cx = rb.left - hb.left + rb.width / 2;
  cy = rb.top - hb.top + rb.height / 2;
  r = rb.width * 0.5;

  // Soft halo: a wide blurred ring, rendered once per resize.
  const pad = r * 0.9, size = Math.ceil((r + pad) * 2);
  glow = document.createElement("canvas");
  glow.width = glow.height = size;
  const g = glow.getContext("2d");
  g.filter = `blur(${Math.round(r * 0.12)}px)`;
  g.strokeStyle = `rgba(${MINT},0.22)`;
  g.lineWidth = r * 0.16;
  g.beginPath(); g.arc(size / 2, size / 2, r * 1.04, 0, Math.PI * 2); g.stroke();
  g.filter = `blur(${Math.round(r * 0.5)}px)`;
  g.fillStyle = "rgba(19,138,94,0.18)";
  g.beginPath(); g.arc(size / 2, size / 2, r * 0.7, 0, Math.PI * 2); g.fill();

  dot = sprite(32, [[0, "rgba(207,251,232,1)"], [0.35, `rgba(${MINT},0.55)`], [1, `rgba(${MINT},0)`]]);

  const n = w < 860 ? 36 : 70;
  parts = Array.from({ length: n }, () => {
    // Bias dust toward the ring side so the headline stays clean.
    const x = w < 860 ? Math.random() * w : w * (0.38 + Math.random() * 0.62);
    return { x, y: Math.random() * h, a: 6 + Math.random() * 18, s: 0.15 + Math.random() * 0.35,
      p: Math.random() * Math.PI * 2, size: 3 + Math.random() * 6, o: 0.25 + Math.random() * 0.5 };
  });
}

function frame(ms) {
  const t = ms / 1000;
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";

  const breathe = 0.85 + 0.15 * Math.sin((t / 8) * Math.PI * 2);
  ctx.globalAlpha = breathe;
  ctx.drawImage(glow, cx - glow.width / 2, cy - glow.height / 2);

  // Two streaks opposite each other, each a tapering trail of soft dots.
  const base = (t / 8) * Math.PI - Math.PI / 2;
  for (const off of [0, Math.PI]) {
    for (let i = 0; i < 48; i++) {
      const a = base + off - i * 0.011;
      const k = 1 - i / 48;
      ctx.globalAlpha = 0.3 * k * k;
      const s = 3 + 9 * k;
      ctx.drawImage(dot, cx + Math.cos(a) * r * 1.04 - s / 2, cy + Math.sin(a) * r * 1.04 - s / 2, s, s);
    }
  }

  for (const q of parts) {
    const x = q.x + Math.cos(t * q.s + q.p) * q.a;
    const rise = q.y - t * 8 * q.s + Math.sin(t * q.s * 0.8 + q.p) * q.a;
    const yy = ((rise % (h + 40)) + h + 40) % (h + 40) - 20;
    ctx.globalAlpha = q.o * (0.6 + 0.4 * Math.sin(t * 1.3 + q.p));
    ctx.drawImage(dot, x - q.size / 2, yy - q.size / 2, q.size, q.size);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

let running = false, raf = 0;
const loop = (ms) => { frame(ms); raf = requestAnimationFrame(loop); };
const start = () => { if (!running && !still) { running = true; raf = requestAnimationFrame(loop); } };
const stop = () => { running = false; cancelAnimationFrame(raf); };

layout();
frame(0);
if (!still) {
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
}
let rt;
addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (!running) frame(0); }, 150); });
document.fonts && document.fonts.ready.then(() => { layout(); if (!running) frame(0); });
