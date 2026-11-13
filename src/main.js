import { createStage } from "./scene.js";
import { access, dedupe, extract, gate } from "./toys.js";
import { game } from "./game.js";

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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
// Without WebGL the page still works; it just has no form on stage.
let stage = { setProgress() {}, setTheme() {}, openGate() {}, rebuildInitials() {} };
try {
  stage = createStage($("#stage"), { reduced });
} catch {
  $("#stage").remove();
}
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
let anchors = [];
function measure() {
  anchors = sections.map((el) => ({ el, shape: Number(el.dataset.shape), mid: el.offsetTop + el.offsetHeight / 2 }));
}
function onScroll() {
  const at = scrollY + innerHeight / 2;
  let i = 0;
  while (i < anchors.length - 2 && at > anchors[i + 1].mid) i++;
  const a = anchors[i];
  const b = anchors[i + 1];
  const t = Math.min(Math.max((at - a.mid) / (b.mid - a.mid), 0), 1);
  const held = Math.min(Math.max((t - 0.22) / 0.56, 0), 1);
  stage.setProgress(a.shape + (b.shape - a.shape) * held);
  const current = t < 0.5 ? i : i + 1;
  $$(".rail a").forEach((link) => link.classList.toggle("on", Number(link.dataset.rail) === current));
}
const remeasure = () => {
  measure();
  onScroll();
};
measure();
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
  { threshold: 0.18 },
);
$$(".act, .outro").forEach((el) => seen.observe(el));

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
gate($("#toy-gate"), { onApprove: () => stage.openGate() });
extract($("#toy-extract"));
dedupe($("#toy-dedupe"));
access($("#toy-access"));
const lesions = game($("#toy-game"));

// ------------------------------------------------------------------ index
const WORK = [
  ["agent-workflow-orchestrator", "Multi-agent workflows as data.", "LangGraph"],
  ["news-watch-agent", "One deduplicated digest, hourly.", "Agent / MCP"],
  ["workbook-review-agent", "It proposes. A person confirms.", "Human in the loop"],
  ["permission-aware-rag", "Answers only what you may read.", "RAG"],
  ["email-to-order-agent", "From free text to a quote.", "Workflow"],
  ["erp-mcp-server", "Guarded writes for agents.", "MCP"],
  ["document-extraction-pipeline", "Schema in, record out.", "Pipeline"],
  ["lesion-level-eval", "Detection by lesion size.", "Evaluation"],
];
$("#work").innerHTML = WORK.map(
  ([name, line, kind], i) => `<li><a href="https://github.com/Bahakirbasogluu/${name}" target="_blank" rel="noopener">
    <span class="n">${String(i + 1).padStart(2, "0")}</span><span class="t">${name}</span><span class="d">${line}</span><span class="k">${kind}</span></a></li>`,
).join("");

// ---------------------------------------------------------------- palette
const go = (id) => () => $(id).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
const open = (url) => () => window.open(url, "_blank", "noopener");
const COMMANDS = [
  ["Orchestration", "Go to", go("#orchestrate")],
  ["Documents", "Go to", go("#documents")],
  ["Research", "Go to", go("#research")],
  ["Teaching", "Go to", go("#teaching")],
  ["Lab", "Go to", go("#lab")],
  ["Index", "Go to", go("#index")],
  ["Contact", "Go to", go("#contact")],
  ["Play: find the lesions", "Game", () => (go("#research")(), setTimeout(() => lesions.start(), 700))],
  ["Lesson mode", "Press T", () => toggleLesson()],
  ["Switch theme", "View", toggleTheme],
  ["GitHub", "Open", open("https://github.com/Bahakirbasogluu")],
  ["LinkedIn", "Open", open("https://www.linkedin.com/in/bahakirbasoglu")],
  ["Medium", "Open", open("https://medium.com/@bahakirbashov")],
  ["Kaggle", "Open", open("https://www.kaggle.com/bahakirbasoglu")],
  ...WORK.map(([name]) => [name, "Repository", open(`https://github.com/Bahakirbasogluu/${name}`)]),
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
  "Report detection by size, next to Dice.",
  "Teach the failure modes first.",
  "Filter before the model, not after.",
  "Read the tests first.",
  "Questions?",
];
let lesson = null;
let lessonAt = 0;
function stepLesson(delta) {
  lessonAt = Math.min(Math.max(lessonAt + delta, 0), anchors.length - 1);
  anchors[lessonAt].el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
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
