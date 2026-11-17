// The behaviour of the parts built from content.js: the case explorer, the teaching panel, the
// path, the facts and the filterable index. Their markup comes from markup.js and is normally
// already in the page; it is only written here when it is missing.
import { CASES, NOW, REPOS } from "./content.js";
import { FILL, pad } from "./markup.js";

const fill = (root) => {
  if (!root.firstElementChild) root.innerHTML = FILL[root.id]();
};

// ------------------------------------------------------------------ ticker
export function ticker(root) {
  let at = 0;
  const show = () => {
    root.classList.remove("on");
    setTimeout(() => {
      root.textContent = NOW[at % NOW.length];
      root.classList.add("on");
      at++;
    }, 380);
  };
  show();
  setInterval(show, 3800);
}

// ------------------------------------------------------------------- cases
// All nine panels share one grid cell, so the panel is as tall as the longest of them
// and the arrows never move.
export function cases(root, { onSelect } = {}) {
  fill(root);
  const tabs = [...root.querySelectorAll(".case-tab")];
  const panels = [...root.querySelectorAll(".case")];
  const panel = root.querySelector(".case-panel");
  const name = root.querySelector("[data-name]");
  const sector = root.querySelector("[data-sector]");
  const count = root.querySelector("[data-count-of]");
  let at = 0;

  function render(i, focus = false) {
    at = (i + CASES.length) % CASES.length;
    tabs.forEach((tab, k) => {
      tab.setAttribute("aria-selected", String(k === at));
      tab.tabIndex = k === at ? 0 : -1;
    });
    panels.forEach((el, k) => {
      el.classList.toggle("on", k === at);
      el.setAttribute("aria-hidden", String(k !== at));
      el.querySelectorAll("a").forEach((link) => (link.tabIndex = k === at ? 0 : -1));
    });
    if (focus) tabs[at].focus({ preventScroll: true });
    panel.setAttribute("aria-labelledby", `case-tab-${at}`);
    name.textContent = CASES[at].name;
    sector.textContent = CASES[at].sector;
    count.textContent = `${pad(at + 1)} / ${pad(CASES.length)}`;
    onSelect?.(at);
  }

  root.addEventListener("click", (ev) => {
    const tab = ev.target.closest(".case-tab");
    if (tab) return render(Number(tab.dataset.i));
    const step = ev.target.closest("[data-step]");
    if (step) render(at + Number(step.dataset.step));
  });
  root.querySelector(".case-list").addEventListener("keydown", (ev) => {
    const move = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[ev.key];
    if (!move) return;
    ev.preventDefault();
    ev.stopPropagation();
    render(at + move, true);
  });
  render(0);
  return { show: render };
}

// ---------------------------------------------------------------- teaching
export function teaching(root) {
  fill(root);
  const chips = [...root.querySelectorAll(".chip")];
  const items = [...root.querySelectorAll(".programme")];
  const show = (i) => {
    chips.forEach((chip, k) => {
      chip.classList.toggle("on", k === i);
      chip.setAttribute("aria-selected", String(k === i));
    });
    items.forEach((item, k) => {
      item.classList.toggle("on", k === i);
      item.setAttribute("aria-hidden", String(k !== i));
    });
  };
  root.addEventListener("click", (ev) => {
    const chip = ev.target.closest(".chip");
    if (chip) show(Number(chip.dataset.i));
  });
  show(0);
}

export function marquee(root) {
  fill(root);
}

// -------------------------------------------------------------------- path
export function trail(root) {
  fill(root);
}

export function facts(root) {
  fill(root);
}

// ------------------------------------------------------------------- index
export function index(root, { onHover } = {}) {
  fill(root);
  const rows = [...root.querySelectorAll(".index li")];
  const chips = [...root.querySelectorAll(".filters .chip")];
  const shown = root.querySelector("[data-shown]");
  root.querySelector(".filters").addEventListener("click", (ev) => {
    const chip = ev.target.closest(".chip");
    if (!chip) return;
    const tag = chip.dataset.tag;
    chips.forEach((c) => c.classList.toggle("on", c === chip));
    let count = 0;
    rows.forEach((row, i) => {
      const keep = !tag || REPOS[i].tags.includes(tag);
      row.classList.toggle("dim", !keep);
      count += keep ? 1 : 0;
    });
    shown.textContent = count;
  });
  const list = root.querySelector(".index");
  list.addEventListener("pointerover", (ev) => {
    const row = ev.target.closest("li");
    if (row) onHover?.(Number(row.dataset.i));
  });
  list.addEventListener("focusin", (ev) => {
    const row = ev.target.closest("li");
    if (row) onHover?.(Number(row.dataset.i));
  });
  list.addEventListener("pointerleave", () => onHover?.(-1));
  list.addEventListener("focusout", () => onHover?.(-1));
}
