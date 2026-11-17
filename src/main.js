import { access, dedupe, extract, gate } from "./toys.js";
import { game } from "./game.js";
import { CASES, REPOS } from "./content.js";
import { cases, facts, index, marquee, teaching, ticker, trail } from "./sections.js";
import { track } from "./track.js";

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// A clean first screen for the share image: open the page with ?card.
if (new URLSearchParams(location.search).has("card")) root.classList.add("card");

// ------------------------------------------------------------------ theme
const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode: the choice simply does not persist */
    }
  },
};
let dark = (store.get("theme") ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";

// ------------------------------------------------------------------ stage
// The stage (and the 3D library behind it) loads after the page itself, so text and panels are
// there first. Calls made before it arrives are kept and replayed. Without WebGL the page still
// works; it just has no form on stage.
let live = null;
const waiting = [];
const stage = new Proxy(
  {},
  {
    get:
      (_, name) =>
      (...args) =>
        live ? live[name](...args) : void waiting.push([name, args]),
  },
);
import("./scene.js")
  .then(({ createStage }) => {
    live = createStage($("#stage"), { reduced });
    for (const [name, args] of waiting) live[name](...args);
    waiting.length = 0;
  })
  .catch(() => $("#stage")?.remove());
function applyTheme() {
  root.dataset.theme = dark ? "dark" : "light";
  $('meta[name="theme-color"]').content = dark ? "#0d0d0c" : "#f4f1ea";
  stage.setTheme(dark);
}
applyTheme();
function toggleTheme() {
  dark = !dark;
  store.set("theme", dark ? "dark" : "light");
  applyTheme();
}
$("#toggle-theme").addEventListener("click", toggleTheme);
document.fonts?.ready.then(() => stage.rebuildInitials());

// The form on stage follows the section in view, and holds still while it is being read.
const sections = $$("[data-shape]");
const where = $("#where");
const prog = $("#prog");
let anchors = [];
function measure() {
  anchors = sections.map((el) => {
    const slot = el.querySelector(".slot").getBoundingClientRect();
    return { el, shape: Number(el.dataset.shape), mid: el.offsetTop + el.offsetHeight / 2, slotTop: slot.top + scrollY, slotMid: slot.top + scrollY + slot.height / 2 };
  });
}
// In the wide sections the form gets the free columns on the right. Its natural width and
// height (in the scene's own units) decide how large it can be drawn there.
const EXTENT = { 3: [5.0, 3.0], 7: [2.5, 4.4], 8: [2.7, 3.9] };
const SEAL = 3.45; // the seal's diameter in the scene's units
function berths() {
  // The seal on the opening screen takes the room between the bar and the headline, to the right.
  const headline = $(".hero .display").getBoundingClientRect();
  const top = 76;
  const room = headline.top + scrollY - top;
  if (innerWidth >= 900 && room > 140) {
    const size = Math.min(room / SEAL, (innerWidth * 0.34) / SEAL);
    const half = (size * SEAL) / 2;
    const x = Math.min(innerWidth * 0.72, innerWidth - half - 40);
    stage.pin(0, { x, y: top + room / 2, size });
  } else {
    stage.pin(0, null);
  }
  for (const { el, shape } of anchors) {
    const extent = EXTENT[shape];
    if (!extent) continue;
    const box = el.querySelector(".berth")?.getBoundingClientRect();
    if (!box || box.width < 120) {
      stage.pin(shape, null);
      continue;
    }
    const size = Math.min((box.width * 0.9) / extent[0], (innerHeight * 0.6) / extent[1]);
    stage.pin(shape, { x: box.left + box.width / 2, y: innerHeight * 0.5, size });
  }
}
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// On a phone the canvas is a band in the page. It is docked on the slot nearest the middle of the
// screen and then scrolls with the page on its own, with no per-frame positioning from here.
// Only the change of form is driven by the scroll position.
const band = $("#stage");
let docked = -1;
function dock(index) {
  docked = index;
  if (!band) return;
  const top = index < 0 ? 0 : Math.round(anchors[index].slotMid - band.clientHeight / 2);
  band.style.opacity = "0";
  band.style.transform = index < 0 ? "" : `translate3d(0, ${top}px, 0)`;
  setTimeout(() => (band.style.opacity = ""), 40);
}
function followSlots() {
  const vh = innerHeight;
  const centre = scrollY + vh / 2;
  let k = 0;
  let nearest = Infinity;
  anchors.forEach((anchor, j) => {
    const distance = Math.abs(anchor.slotMid - centre);
    if (distance < nearest) {
      nearest = distance;
      k = j;
    }
  });
  if (k !== docked) dock(k);
  if (k === 0) return stage.setProgress(anchors[0].shape);
  const enter = clamp01((scrollY + vh - anchors[k].slotTop) / (vh * 0.55));
  stage.setProgress(anchors[k - 1].shape + (anchors[k].shape - anchors[k - 1].shape) * enter);
}
function onScroll() {
  const at = scrollY + innerHeight / 2;
  let i = 0;
  while (i < anchors.length - 2 && at > anchors[i + 1].mid) i++;
  const a = anchors[i];
  const b = anchors[i + 1];
  const t = Math.min(Math.max((at - a.mid) / (b.mid - a.mid), 0), 1);
  const held = Math.min(Math.max((t - 0.22) / 0.56, 0), 1);
  if (innerWidth < 900) {
    followSlots();
  } else {
    if (docked !== -1) dock(-1);
    stage.setProgress(a.shape + (b.shape - a.shape) * held);
  }
  const current = t < 0.5 ? i : i + 1;
  let label = "";
  $$(".rail a").forEach((link) => {
    const on = Number(link.dataset.rail) === current;
    link.classList.toggle("on", on);
    if (on) label = link.dataset.name;
  });
  if (where.textContent !== label) where.textContent = label;
  where.classList.toggle("on", Boolean(label));
  const span = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${span > 0 ? Math.min(scrollY / span, 1) : 0})`;
}
const remeasure = () => {
  measure();
  berths();
  if (docked !== -1) docked = -2; // the slots have moved: dock again
  onScroll();
};
measure();
berths();
addEventListener("resize", remeasure);
addEventListener("load", remeasure);
addEventListener("scroll", onScroll, { passive: true });
// Section heights change as panels and the index are filled in and as the font loads.
new ResizeObserver(remeasure).observe($("main"));
document.fonts?.ready.then(remeasure);
onScroll();

// ----------------------------------------------------------------- reveal
const seen = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        seen.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.08 },
);
$$(".act, .outro").forEach((el) => seen.observe(el));

// Numbers count up the first time they are seen.
const counted = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      counted.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? "";
      const format = (n) => Math.round(n).toLocaleString("en-US") + suffix;
      if (reduced) continue;
      const start = performance.now();
      const timer = setInterval(() => {
        const p = Math.min((performance.now() - start) / 1400, 1);
        el.textContent = format(target * (1 - Math.pow(1 - p, 4)));
        if (p === 1) clearInterval(timer);
      }, 32);
    }
  },
  { threshold: 0.6 },
);
$$("[data-count]").forEach((el) => counted.observe(el));

// ----------------------------------------------------------------- loader
(() => {
  const loader = $("#loader");
  const count = $("#loader-count");
  const start = performance.now();
  const length = reduced ? 1 : 620;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    count.textContent = "100";
    loader.classList.add("done");
    $(".hero").classList.add("in");
    setTimeout(() => loader.remove(), 1000);
  };
  const tick = (now) => {
    const p = Math.min((now - start) / length, 1);
    count.textContent = String(Math.round(p * 100));
    if (p < 1) return requestAnimationFrame(tick);
    finish();
  };
  requestAnimationFrame(tick);
  setTimeout(finish, length + 400); // never leave the page behind the loader, even in a background tab
})();

// ----------------------------------------------------------------- cursor
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = $("#cursor");
  addEventListener("pointermove", (ev) => {
    cursor.style.transform = `translate3d(${ev.clientX}px, ${ev.clientY}px, 0)`;
    cursor.classList.add("on");
    cursor.classList.toggle("hot", Boolean(ev.target.closest?.("a, button, .chip, [data-view], input, label")));
  });
  document.addEventListener("pointerleave", () => cursor.classList.remove("on"));
}

// ------------------------------------------------------------------- toys
gate($("#toy-gate"), {
  onApprove: () => {
    stage.openGate();
    const box = $("#toy-gate").getBoundingClientRect();
    stage.pulse(box.left + box.width / 2, box.top + box.height / 2);
  },
});
extract($("#toy-extract"));
dedupe($("#toy-dedupe"));
access($("#toy-access"));
const lesions = game($("#toy-game"));

// --------------------------------------------------------------- sections
const SHAPE = { work: 3, index: 8 };
ticker($("#now"));
const explorer = cases($("#cases"), { onSelect: (i) => stage.focus(SHAPE.work, i) });
teaching($("#teach"));
marquee($("#trained"));
trail($("#trail"));
facts($("#facts"));
index($("#work-index"), { onHover: (i) => stage.focus(SHAPE.index, i) });
track();

// The number and the address are put together here, so they are not sitting in the page source for harvesters.
const PHONE = ["+90", "553", "266", "07", "67"];
const call = $("#call");
call.textContent = PHONE.join(" ");
call.href = `tel:${PHONE.join("")}`;
const MAIL = ["bahakirbasoglu01", "gmail.com"];
const mail = $("#mail");
mail.textContent = MAIL.join("@");
mail.href = `mailto:${MAIL.join("@")}`;

// A click on empty page sends a ripple through the form.
addEventListener("pointerdown", (ev) => {
  if (ev.target.closest("a, button, input, label, .bench, .palette, .viewer")) return;
  stage.pulse(ev.clientX, ev.clientY);
});

// ---------------------------------------------------------------- palette
// Scroll to an element; if the smooth scroll has not got there shortly after, jump.
function glide(el, block = "start") {
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block });
  if (reduced) return;
  const from = scrollY;
  setTimeout(() => {
    if (Math.abs(scrollY - from) < 2) el.scrollIntoView({ behavior: "auto", block });
  }, 450);
}
const go = (id) => () => glide($(id));
const open = (url) => () => window.open(url, "_blank", "noopener");
const showCase = (i) => () => (go("#work")(), explorer.show(i));
const COMMANDS = [
  ["Orchestration", "Go to", go("#orchestrate")],
  ["Documents", "Go to", go("#documents")],
  ["Client work", "Go to", go("#work")],
  ["Research", "Go to", go("#research")],
  ["Teaching", "Go to", go("#teaching")],
  ["Lab", "Go to", go("#lab")],
  ["Path", "Go to", go("#path")],
  ["Index", "Go to", go("#index")],
  ["Contact", "Go to", go("#contact")],
  ...CASES.map((c, i) => [c.name, "Engagement", showCase(i)]),
  ["Play: find the lesions", "Game", () => (go("#research")(), setTimeout(() => lesions.start(), 700))],
  ["Lesson mode", "Press T", () => toggleLesson()],
  ["Switch theme", "View", toggleTheme],
  ["GitHub", "Open", open("https://github.com/Bahakirbasogluu")],
  ["LinkedIn", "Open", open("https://www.linkedin.com/in/bahakirbasoglu")],
  ["Medium", "Open", open("https://medium.com/@bahakirbashov")],
  ["Kaggle", "Open", open("https://www.kaggle.com/bahakirbasoglu")],
  ...REPOS.map((repo) => [repo.name, "Repository", open(repo.url)]),
];
const palette = $("#palette");
const input = $("#palette-input");
const list = $("#palette-list");
let shown = [];
let cursorAt = 0;
function renderPalette() {
  const q = input.value.trim().toLowerCase();
  shown = COMMANDS.filter(([name, kind]) => !q || `${name} ${kind}`.toLowerCase().includes(q));
  cursorAt = Math.min(cursorAt, Math.max(shown.length - 1, 0));
  list.innerHTML = shown.map(([name, kind], i) => `<li role="option" data-i="${i}" aria-selected="${i === cursorAt}">${name}<small>${kind}</small></li>`).join("");
  list.children[cursorAt]?.scrollIntoView({ block: "nearest" });
}
function openPalette() {
  palette.hidden = false;
  input.value = "";
  cursorAt = 0;
  renderPalette();
  input.focus();
}
function closePalette() {
  palette.hidden = true;
}
function runCommand(i) {
  const command = shown[i];
  if (!command) return;
  closePalette();
  command[2]();
}
$("#open-palette").addEventListener("click", openPalette);
palette.addEventListener("pointerdown", (ev) => ev.target === palette && closePalette());
list.addEventListener("click", (ev) => {
  const item = ev.target.closest("[data-i]");
  if (item) runCommand(Number(item.dataset.i));
});
input.addEventListener("input", () => {
  cursorAt = 0;
  renderPalette();
});
input.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
    ev.preventDefault();
    cursorAt = (cursorAt + (ev.key === "ArrowDown" ? 1 : -1) + shown.length) % Math.max(shown.length, 1);
    renderPalette();
  } else if (ev.key === "Enter") {
    runCommand(cursorAt);
  }
});

// ------------------------------------------------------------ lesson mode
// Press T and the page becomes a lecture: one section per step, a note for each.
const NOTES = [
  "An agent is only useful if someone can sign for what it did.",
  "Typed ports between agents. One human interrupt. Bounded loops.",
  "Extract what is printed. Judge it afterwards, in code.",
  "Same habit in every sector: the system proposes, a person signs.",
  "Report detection by size, next to Dice.",
  "Teach the failure modes first.",
  "Filter before the model, not after.",
  "Models first, then the systems around them.",
  "Read the tests first.",
  "Questions?",
];
let lesson = null;
let lessonAt = 0;
function stepLesson(delta) {
  lessonAt = Math.min(Math.max(lessonAt + delta, 0), anchors.length - 1);
  glide(anchors[lessonAt].el, "center");
  lesson.querySelector("b").textContent = `${lessonAt + 1} / ${anchors.length}`;
  lesson.querySelector("span").textContent = NOTES[lessonAt];
}
function toggleLesson() {
  if (lesson) {
    lesson.remove();
    lesson = null;
    root.classList.remove("lesson");
    return;
  }
  lesson = document.createElement("div");
  lesson.className = "lesson-bar";
  lesson.innerHTML = `<b></b><span></span><em>← → step &nbsp; T leave</em>`;
  document.body.append(lesson);
  root.classList.add("lesson");
  const at = scrollY + innerHeight / 2;
  lessonAt = Math.max(0, anchors.findIndex((x) => at < x.el.offsetTop + x.el.offsetHeight));
  stepLesson(0);
}

addEventListener("keydown", (ev) => {
  const typing = ev.target.matches?.("input, textarea");
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
    ev.preventDefault();
    return palette.hidden ? openPalette() : closePalette();
  }
  if (ev.key === "Escape" && !palette.hidden) return closePalette();
  if (typing || !palette.hidden || ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (ev.key === "/") {
    ev.preventDefault();
    openPalette();
  } else if (ev.key.toLowerCase() === "t") {
    toggleLesson();
  } else if (lesson && (ev.key === "ArrowRight" || ev.key === "ArrowDown" || ev.key === " ")) {
    ev.preventDefault();
    stepLesson(1);
  } else if (lesson && (ev.key === "ArrowLeft" || ev.key === "ArrowUp")) {
    ev.preventDefault();
    stepLesson(-1);
  }
});
