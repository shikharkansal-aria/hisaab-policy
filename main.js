// Light motion for the landing page only. Content is fully readable without it.
import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm";

window.__motion = true;

if (document.documentElement.classList.contains("anim")) {
  const hero = document.querySelectorAll(".hero [data-reveal]");
  animate(hero, { opacity: [0, 1], transform: ["translateY(18px)", "none"] },
    { duration: 0.7, delay: stagger(0.1), easing: [0.22, 1, 0.36, 1] });

  // Count today's number up, then type the answer into the question card.
  const today = document.getElementById("today");
  const target = Number(today.textContent);
  animate(0, target, { duration: 1.2, delay: 0.5, easing: "ease-out",
    onUpdate: (v) => { today.textContent = Math.round(v); } });

  const typed = document.getElementById("typed");
  const answer = typed.textContent;
  typed.textContent = "";
  const ask = document.getElementById("ask");
  ask.style.opacity = "0";
  animate(ask, { opacity: [0, 1], transform: ["translateY(24px)", "none"] },
    { duration: 0.6, delay: 1.4 }).then(() => {
      let i = 0;
      const tick = setInterval(() => {
        typed.textContent = answer.slice(0, ++i);
        if (i >= answer.length) clearInterval(tick);
      }, 70);
    });

  document.querySelectorAll("main > section [data-reveal]").forEach((el) => {
    inView(el, () => {
      animate(el, { opacity: [0, 1], transform: ["translateY(18px)", "none"] }, { duration: 0.6 });
    }, { amount: 0.3 });
  });
}
