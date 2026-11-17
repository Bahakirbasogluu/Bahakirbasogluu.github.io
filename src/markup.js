// The markup of the parts that are built from content.js, as plain strings. The build writes them
// into index.html so the text is in the page source; the browser then only adds the behaviour.
import { CASES, EARLIER, FACTS, PROGRAMMES, REPOS, SEMESTERS, TAGS, TOOLBOX, TRAIL, TRAINED, repoUrl } from "./content.js";

export const pad = (n) => String(n).padStart(2, "0");
const ext = 'target="_blank" rel="noopener"';

export const casesHTML = () => `
    <div class="case-list" role="tablist" aria-label="Engagements">
      ${CASES.map(
        (c, i) => `<button class="case-tab" role="tab" id="case-tab-${i}" aria-controls="case-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
          <span class="n">${pad(i + 1)}</span><span class="t">${c.name}</span><span class="s">${c.sector}</span></button>`,
      ).join("")}
    </div>
    <article class="bench case-panel" id="case-panel" role="tabpanel">
      <div class="bench-head"><b data-name></b><span data-sector></span></div>
      <div class="case-stack">
        ${CASES.map(
          (c) => `<div class="bench-body case" aria-hidden="true">
            <div class="figure"><strong>${c.figure}</strong><p>${c.caption}</p></div>
            <dl class="parts">${c.parts.map(([title, text]) => `<div><dt>${title}</dt><dd>${text}</dd></div>`).join("")}</dl>
            <div class="chips still">${c.stack.map((x) => `<span class="chip">${x}</span>`).join("")}</div>
            ${c.open.length ? `<p class="open"><small>Open version</small>${c.open.map((name) => `<a href="${repoUrl(name)}" ${ext} tabindex="-1">${name}</a>`).join("")}</p>` : ""}
          </div>`,
        ).join("")}
      </div>
      <div class="bench-foot">
        <button class="btn" data-step="-1" aria-label="Previous engagement">←</button>
        <button class="btn" data-step="1" aria-label="Next engagement">→</button>
        <span class="count" data-count-of></span>
      </div>
    </article>
    <div class="berth" aria-hidden="true"></div>`;

export const teachingHTML = () => `
    <div class="bench-head"><b>Programmes</b><span>${PROGRAMMES.length} formats</span></div>
    <div class="bench-body">
      <div class="chips" role="tablist" aria-label="Training programmes">
        ${PROGRAMMES.map(([name], i) => `<button class="chip${i === 0 ? " on" : ""}" role="tab" aria-selected="${i === 0}" data-i="${i}">${name}</button>`).join("")}
      </div>
      <div class="programme-stack" aria-live="polite">
        ${PROGRAMMES.map(([, audience, text]) => `<div class="programme" aria-hidden="true"><small>${audience}</small><p>${text}</p></div>`).join("")}
      </div>
    </div>
    <div class="terms" aria-label="University semesters">
      ${SEMESTERS.map(([term, where], i) => `<div class="${i === SEMESTERS.length - 1 ? "current" : ""}"><small>${term}</small><span>${where}</span></div>`).join("")}
    </div>`;

export const marqueeHTML = () => {
  const run = TRAINED.map((name) => `<span>${name}</span>`).join("");
  return `<div class="marquee-run">${run}</div><div class="marquee-run" aria-hidden="true">${run}</div>`;
};

export const trailHTML = () =>
  TRAIL.map(
    (step, i) => `<li${step.now ? ' class="live"' : ""}><details name="trail"${i === 0 ? " open" : ""}>
      <summary><span class="when">${step.when}</span><span class="what"><b>${step.role}</b><i>${step.at}</i></span></summary>
      <p>${step.text}</p></details></li>`,
  ).join("");

export const factsHTML = () =>
  FACTS.map(
    (block) => `<section class="fact"><h3>${block.title}</h3>
        ${block.rows.map(([title, note, url]) => `<p>${url ? `<a href="${url}" ${ext}>${title}</a>` : `<b>${title}</b>`}<small>${note}</small></p>`).join("")}</section>`,
  ).join("") +
  `<section class="fact fact-wide"><h3>Toolbox</h3>
      ${TOOLBOX.map(([title, items]) => `<p><small>${title}</small></p><div class="chips still">${items.map((x) => `<span class="chip">${x}</span>`).join("")}</div>`).join("")}
    </section>`;

export const indexHTML = () => `
    <div class="filters" role="group" aria-label="Filter repositories">
      <button class="chip on" data-tag="">All</button>
      ${TAGS.map((tag) => `<button class="chip" data-tag="${tag}">${tag}</button>`).join("")}
      <span class="tally"><b data-shown>${REPOS.length}</b> of ${REPOS.length}</span>
    </div>
    <ol class="index">
      ${REPOS.map(
        (repo, i) => `<li data-i="${i}"><a href="${repo.url}" ${ext}>
          <span class="n">${pad(i + 1)}</span><span class="t">${repo.name}</span><span class="d">${repo.line}</span>
          <span class="k">${repo.kind}</span></a></li>`,
      ).join("")}
    </ol>
    <div class="earlier">
      <p class="eyebrow">Research and earlier work</p>
      <ul>${EARLIER.map(([name, line, url]) => `<li><a href="${url}" ${ext}><b>${name}</b><span>${line}</span></a></li>`).join("")}</ul>
    </div>`;

// Which container gets which markup; used by the build and by the page.
export const FILL = { cases: casesHTML, teach: teachingHTML, trained: marqueeHTML, trail: trailHTML, facts: factsHTML, "work-index": indexHTML };
