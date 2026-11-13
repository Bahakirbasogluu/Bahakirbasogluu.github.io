// The parts of the page that are built from content.js: the case explorer, the teaching panel,
// the path, the facts, the toolbox and the filterable index.
import { CASES, EARLIER, FACTS, NOW, PROGRAMMES, REPOS, SEMESTERS, TAGS, TOOLBOX, TRAIL, TRAINED, repoUrl } from "./content.js";

const pad = (n) => String(n).padStart(2, "0");
const ext = 'target="_blank" rel="noopener"';

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
export function cases(root, { onSelect } = {}) {
  root.innerHTML = `
    <div class="case-list" role="tablist" aria-label="Engagements">
      ${CASES.map(
        (c, i) => `<button class="case-tab" role="tab" id="case-tab-${i}" aria-controls="case-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
          <span class="n">${pad(i + 1)}</span><span class="t">${c.name}</span><span class="s">${c.sector}</span></button>`,
      ).join("")}
    </div>
    <article class="bench case-panel" id="case-panel" role="tabpanel" aria-live="polite"></article>`;
  const tabs = [...root.querySelectorAll(".case-tab")];
  const panel = root.querySelector(".case-panel");
  let at = 0;

  function render(i, focus = false) {
    at = (i + CASES.length) % CASES.length;
    const c = CASES[at];
    tabs.forEach((tab, k) => {
      tab.setAttribute("aria-selected", String(k === at));
      tab.tabIndex = k === at ? 0 : -1;
    });
    if (focus) tabs[at].focus({ preventScroll: true });
    panel.setAttribute("aria-labelledby", `case-tab-${at}`);
    panel.classList.remove("show");
    panel.innerHTML = `
      <div class="bench-head"><b>${c.name}</b><span>${c.sector}</span></div>
      <div class="bench-body">
        <div class="figure"><strong>${c.figure}</strong><p>${c.caption}</p></div>
        <dl class="parts">${c.parts.map(([title, text]) => `<div><dt>${title}</dt><dd>${text}</dd></div>`).join("")}</dl>
        <div class="chips still">${c.stack.map((x) => `<span class="chip">${x}</span>`).join("")}</div>
      </div>
      <div class="bench-foot">
        <button class="btn" data-step="-1" aria-label="Previous engagement">←</button>
        <button class="btn" data-step="1" aria-label="Next engagement">→</button>
        <span class="count">${pad(at + 1)} / ${pad(CASES.length)}</span>
        <span class="open">${
          c.open.length
            ? `<small>Open version</small>${c.open.map((name) => `<a href="${repoUrl(name)}" ${ext}>${name}</a>`).join("")}`
            : `<small>Client code stays private</small>`
        }</span>
      </div>`;
    requestAnimationFrame(() => panel.classList.add("show"));
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
  root.innerHTML = `
    <div class="bench-head"><b>Programmes</b><span>${PROGRAMMES.length} formats</span></div>
    <div class="bench-body">
      <div class="chips" role="tablist" aria-label="Training programmes">
        ${PROGRAMMES.map(([name], i) => `<button class="chip${i === 0 ? " on" : ""}" role="tab" aria-selected="${i === 0}" data-i="${i}">${name}</button>`).join("")}
      </div>
      <div class="programme" aria-live="polite"><small></small><p></p></div>
    </div>
    <div class="terms" aria-label="University semesters">
      ${SEMESTERS.map(([term, where], i) => `<div class="${i === SEMESTERS.length - 1 ? "current" : ""}"><small>${term}</small><span>${where}</span></div>`).join("")}
    </div>`;
  const chips = [...root.querySelectorAll(".chip")];
  const audience = root.querySelector(".programme small");
  const text = root.querySelector(".programme p");
  const show = (i) => {
    chips.forEach((chip, k) => {
      chip.classList.toggle("on", k === i);
      chip.setAttribute("aria-selected", String(k === i));
    });
    audience.textContent = PROGRAMMES[i][1];
    text.textContent = PROGRAMMES[i][2];
  };
  root.addEventListener("click", (ev) => {
    const chip = ev.target.closest(".chip");
    if (chip) show(Number(chip.dataset.i));
  });
  show(0);
}

export function marquee(root) {
  const run = TRAINED.map((name) => `<span>${name}</span>`).join("");
  root.innerHTML = `<div class="marquee-run">${run}</div><div class="marquee-run" aria-hidden="true">${run}</div>`;
}

// -------------------------------------------------------------------- path
export function trail(root) {
  root.innerHTML = TRAIL.map(
    (step) => `<li${step.now ? ' class="live"' : ""}>
      <span class="when">${step.when}</span>
      <span class="what"><b>${step.role}</b><i>${step.at}</i></span>
      <p>${step.text}</p></li>`,
  ).join("");
}

export function facts(root) {
  root.innerHTML =
    FACTS.map(
      (block) => `<section class="fact"><h3>${block.title}</h3>
        ${block.rows.map(([title, note, url]) => `<p>${url ? `<a href="${url}" ${ext}>${title}</a>` : `<b>${title}</b>`}<small>${note}</small></p>`).join("")}</section>`,
    ).join("") +
    `<section class="fact fact-wide"><h3>Toolbox</h3>
      ${TOOLBOX.map(([title, items]) => `<p><small>${title}</small></p><div class="chips still">${items.map((x) => `<span class="chip">${x}</span>`).join("")}</div>`).join("")}
    </section>`;
}

// ------------------------------------------------------------------- index
export function index(root, { onHover } = {}) {
  root.innerHTML = `
    <div class="filters" role="group" aria-label="Filter repositories">
      <button class="chip on" data-tag="">All</button>
      ${TAGS.map((tag) => `<button class="chip" data-tag="${tag}">${tag}</button>`).join("")}
      <span class="tally"><b data-shown>${REPOS.length}</b> of ${REPOS.length}</span>
    </div>
    <ol class="index">
      ${REPOS.map(
        (repo, i) => `<li data-i="${i}"><a href="${repo.url}" ${ext}>
          <span class="n">${pad(i + 1)}</span><span class="t">${repo.name}</span><span class="d">${repo.line}</span>
          <span class="k"><em>${repo.tests} tests</em>${repo.kind}</span></a></li>`,
      ).join("")}
    </ol>
    <div class="earlier">
      <p class="eyebrow">Research and earlier work</p>
      <ul>${EARLIER.map(([name, line, url]) => `<li><a href="${url}" ${ext}><b>${name}</b><span>${line}</span></a></li>`).join("")}</ul>
    </div>`;
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
