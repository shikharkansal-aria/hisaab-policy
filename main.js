// Light motion for the landing page only. Content is fully readable without it.
import { animate, scroll, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm";

window.__motion = true;

// Month tracker: 17 of 28 days filled (example data, drawn here to keep the HTML short).
const days = document.getElementById("days");
for (let i = 0; i < 28; i++) {
  const d = document.createElement("i");
  if (i >= 17) d.className = "off";
  days.appendChild(d);
}

if (document.documentElement.classList.contains("anim")) {
  const ease = [0.22, 1, 0.36, 1];
  animate(".hero-copy [data-reveal]", { opacity: [0, 1], transform: ["translateY(18px)", "none"] },
    { duration: 0.8, delay: stagger(0.12), easing: ease });

  const cards = document.querySelectorAll("[data-card]");
  cards.forEach((c) => { c.style.opacity = "0"; });
  animate(cards, { opacity: [0, 1], transform: ["translateY(40px)", "none"] },
    { duration: 0.9, delay: stagger(0.15, { start: 0.5 }), easing: ease });

  const today = document.getElementById("today");
  const target = Number(today.textContent);
  animate(0, target, { duration: 1.3, delay: 0.7, easing: "ease-out",
    onUpdate: (v) => { today.textContent = Math.round(v); } });

  // Hills drift at different speeds as the hero scrolls away.
  const hero = document.querySelector(".hero");
  [["#hill-back", 20], ["#hill-mid", 45], ["#tree-left", 60], ["#tree-right", 60], ["#hill-front", 80]].forEach(([sel, px]) => {
    scroll(animate(sel, { transform: ["translateY(0px)", `translateY(${px}px)`] }),
      { target: hero, offset: ["start start", "end start"] });
  });

  document.querySelectorAll("main [data-reveal]").forEach((el) => {
    inView(el, () => {
      animate(el, { opacity: [0, 1], transform: ["translateY(24px)", "none"] }, { duration: 0.7, easing: ease });
    }, { amount: 0.25 });
  });
}

// Type the hero answer, then cycle example answers in the question section.
function typeInto(el, text, done) {
  let i = 0;
  el.textContent = "";
  const t = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(t); if (done) done(); }
  }, 65);
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) {
  const typed = document.getElementById("typed");
  setTimeout(() => typeInto(typed, typed.textContent), 1600);

  const cycle = document.getElementById("cycle");
  const answers = ["auto to college", "mom's birthday gift", "groceries for the week", "movie with friends"];
  let n = 0;
  let started = false;
  inView(cycle, () => {
    if (started) return;
    started = true;
    const next = () => typeInto(cycle, answers[n++ % answers.length], () => setTimeout(next, 1800));
    next();
  }, { amount: 1 });
}
