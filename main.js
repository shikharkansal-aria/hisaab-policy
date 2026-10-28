// Motion for the landing page only. Content is fully readable without it.
import { animate, scroll, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm";

window.__motion = true;
const animOn = document.documentElement.classList.contains("anim");
const EXPO = [0.16, 1, 0.3, 1];
const SHUTTER = [0.76, 0, 0.24, 1];

// Blueprint grid: lines plus a cross at every intersection.
const grid = document.getElementById("grid");
const xs = ["14%", "39%", "64%", "88%"], ys = ["30%", "74%"];
const add = (cls, style) => { const e = document.createElement("i"); e.className = cls; Object.assign(e.style, style); grid.appendChild(e); return e; };
const vLines = xs.map((left) => add("v", { left }));
const hLines = ys.map((top) => add("h", { top }));
const pluses = ys.flatMap((top) => xs.map((left) => add("plus", { top, left })));

// Day ring: 30 dots for the month, 17 filled (example), a progress arc behind them.
const NS = "http://www.w3.org/2000/svg";
const ring = document.getElementById("ring");
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); ring.appendChild(e); return e; };
el("circle", { r: 52, fill: "none", stroke: "rgba(255,255,255,.08)", "stroke-width": 0.6 });
const arc = el("circle", { r: 44, fill: "none", stroke: "#5be3ad", "stroke-width": 1.4, "stroke-linecap": "round",
  "stroke-dasharray": `${2 * Math.PI * 44 * 17 / 30} 999`, transform: "rotate(-90)" });
el("circle", { r: 44, fill: "none", stroke: "rgba(255,255,255,.1)", "stroke-width": 1.4, "stroke-dasharray": "0.6 2.4" });
const dots = [];
for (let i = 0; i < 30; i++) {
  const a = (i / 30) * Math.PI * 2 - Math.PI / 2;
  const on = i < 17;
  dots.push(el("circle", { cx: (52 * Math.cos(a)).toFixed(2), cy: (52 * Math.sin(a)).toFixed(2), r: on ? 2.1 : 1.6,
    fill: on ? "#5be3ad" : "none", stroke: on ? "none" : "rgba(255,255,255,.35)", "stroke-width": 0.5 }));
}

if (animOn) {
  vLines.forEach((l, i) => animate(l, { transform: ["scaleY(0)", "scaleY(1)"] }, { duration: 1.2, delay: 0.5 + i * 0.1, easing: EXPO }));
  hLines.forEach((l, i) => animate(l, { transform: ["scaleX(0)", "scaleX(1)"] }, { duration: 1.2, delay: 0.7 + i * 0.15, easing: EXPO }));
  animate(pluses, { opacity: [0, 1], transform: ["translate(-50%,-50%) scale(.6)", "translate(-50%,-50%) scale(1)"] },
    { duration: 0.6, delay: stagger(0.07, { start: 0.9 }), easing: EXPO });

  animate("[data-in='down']", { opacity: [0, 1], transform: ["translateY(-10px)", "none"] }, { duration: 0.8, delay: 0.15, easing: EXPO });
  animate(".hx-copy [data-in='up']", { opacity: [0, 1], transform: ["translateY(14px)", "none"] }, { duration: 0.9, delay: stagger(0.5, { start: 0.3 }), easing: EXPO });
  animate("[data-in='left']", { opacity: [0, 1], transform: ["translateX(20px)", "none"] }, { duration: 0.8, delay: 1.2, easing: EXPO });

  // Headline: each word rises out of its own mask.
  const h1 = document.getElementById("headline");
  const words = h1.textContent.trim().split(" ");
  h1.innerHTML = words.map((w) => `<span class="w"><span>${w}</span></span>`).join(" ");
  h1.style.opacity = "1";
  animate(h1.querySelectorAll(".w > span"), { transform: ["translateY(120%)", "none"] }, { duration: 1.05, delay: stagger(0.06, { start: 0.45 }), easing: EXPO });

  // Buttons wipe up from the bottom.
  animate("[data-wipe]", { opacity: [0, 1], clipPath: ["inset(100% 0 0 0 round 999px)", "inset(0% 0 0 0 round 999px)"] },
    { duration: 0.75, delay: stagger(0.08, { start: 1.0 }), easing: SHUTTER });

  // Ring draws in, then dots pop in order, then labels and their lines.
  const len = 2 * Math.PI * 44 * 17 / 30;
  animate(arc, { strokeDasharray: [`0 999`, `${len} 999`] }, { duration: 1.6, delay: 0.6, easing: EXPO });
  animate(dots, { opacity: [0, 1] }, { duration: 0.3, delay: stagger(0.03, { start: 0.6 }) });
  animate("[data-node]", { opacity: [0, 1], transform: ["translateY(8px)", "none"] }, { duration: 0.8, delay: stagger(0.3, { start: 1.3 }), easing: EXPO });

  const today = document.getElementById("today");
  const target = Number(today.textContent);
  animate(0, target, { duration: 1.6, delay: 0.6, easing: EXPO, onUpdate: (v) => { today.textContent = Math.round(v); } });

  // The ring turns slowly as you scroll past the hero.
  scroll(animate(ring, { transform: ["rotate(0deg)", "rotate(40deg)"] }), { target: document.querySelector(".hx"), offset: ["start start", "end start"] });

  document.querySelectorAll("main [data-reveal]").forEach((e) => {
    inView(e, () => { animate(e, { opacity: [0, 1], transform: ["translateY(24px)", "none"] }, { duration: 0.7, easing: EXPO }); }, { amount: 0.25 });
  });
}

// Cycle example answers in the question section.
function typeInto(e, text, done) {
  let i = 0;
  e.textContent = "";
  const t = setInterval(() => {
    e.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(t); if (done) done(); }
  }, 65);
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const cycle = document.getElementById("cycle");
  const answers = ["auto to college", "mom's birthday gift", "groceries for the week", "movie with friends"];
  let n = 0, started = false;
  inView(cycle, () => {
    if (started) return;
    started = true;
    const next = () => typeInto(cycle, answers[n++ % answers.length], () => setTimeout(next, 1800));
    next();
  }, { amount: 1 });
}
