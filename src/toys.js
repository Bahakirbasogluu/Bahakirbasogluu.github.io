// Small working models of the patterns the page talks about.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const HOLD_MS = 650;
const h = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
};

function shell(root, title, tag, body, foot) {
  root.append(
    h(`<div class="bench-head"><b>${title}</b><span>${tag}</span></div>
       <div class="bench-body">${body}</div>
       <div class="bench-foot">${foot}</div>`),
  );
}

// ------------------------------------------------------------------ gate
export function gate(root, { onApprove } = {}) {
  shell(
    root,
    "Approval gate",
    "credit-review@1",
    `<div class="flow">
       <div class="node" data-n="tools"><i></i>Tools</div>
       <div class="node twin" data-n="analysts"><i></i>Analysts</div>
       <div class="node" data-n="synth"><i></i>Synthesis</div>
       <div class="node" data-n="review"><i></i>Review</div>
       <div class="node" data-n="memo"><i></i>Memo</div>
     </div>
     <div class="memo" data-memo>Run a case. It stops at review and waits for you.</div>
     <label class="check"><input type="checkbox" data-own /> I started this run</label>`,
    `<button class="btn" data-run>Run case</button>
     <button class="btn go" data-ok disabled>Hold to approve</button>
     <button class="btn" data-back disabled>Send back</button>
     <span class="note" data-note></span>`,
  );
  const $ = (s) => root.querySelector(s);
  const node = (n) => root.querySelector(`[data-n="${n}"]`);
  const memo = $("[data-memo]");
  const note = $("[data-note]");
  const run = $("[data-run]");
  const ok = $("[data-ok]");
  const back = $("[data-back]");
  const own = $("[data-own]");
  let round = 0;
  let busy = false;

  const step = async (name, ms) => {
    node(name).classList.add("run");
    await wait(ms);
    node(name).classList.remove("run");
    node(name).classList.add("done");
  };
  const say = (text, kind = "") => {
    note.textContent = text;
    note.className = `note ${kind}`;
  };
  const arm = (on) => {
    ok.disabled = !on;
    back.disabled = !on;
  };
  async function toReview() {
    node("synth").classList.remove("done");
    await step("synth", 620);
    round += 1;
    node("review").classList.add("wait");
    memo.textContent = `Recommendation: approve with conditions.\nLeverage 4.5x breaches policy (max 4.0x).\nWaiting for a credit officer. Round ${round} of 2.`;
    say("");
    arm(true);
  }
  run.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    run.disabled = true;
    round = 0;
    root.querySelectorAll(".node").forEach((n) => n.classList.remove("done", "wait", "run"));
    memo.textContent = "Calculating ratios and checking policy…";
    say("");
    await step("tools", 420);
    memo.textContent = "Two analysts work in parallel on different inputs…";
    await step("analysts", 760);
    await toReview();
  });

  // Approval is held, not clicked: a decision should take a moment.
  let held = null;
  const release = () => {
    if (!held) return;
    clearTimeout(held.timer);
    cancelAnimationFrame(held.raf);
    held = null;
    ok.style.background = "";
  };
  const hold = (ev) => {
    if (ok.disabled || held) return;
    ev.preventDefault();
    if (own.checked) {
      say("Four eyes: whoever starts a run cannot approve it.", "bad");
      return;
    }
    const start = performance.now();
    const mine = (held = {});
    // The timer decides; the animation only shows it.
    mine.timer = setTimeout(() => {
      if (held !== mine) return;
      release();
      approve();
    }, HOLD_MS);
    const tick = (now) => {
      if (held !== mine) return;
      const p = Math.min((now - start) / HOLD_MS, 1);
      ok.style.background = `linear-gradient(90deg, var(--ink) ${p * 100}%, var(--accent) ${p * 100}%)`;
      if (p < 1) mine.raf = requestAnimationFrame(tick);
    };
    mine.raf = requestAnimationFrame(tick);
  };
  ok.addEventListener("pointerdown", hold);
  ok.addEventListener("keydown", (ev) => (ev.key === "Enter" || ev.key === " ") && !ev.repeat && hold(ev));
  ["pointerup", "pointerleave", "keyup", "blur"].forEach((name) => ok.addEventListener(name, release));

  async function approve() {
    arm(false);
    node("review").classList.remove("wait");
    node("review").classList.add("done");
    onApprove?.();
    await step("memo", 520);
    memo.innerHTML = `<b>Credit memo: Bluefield Components GmbH</b>\nApprove with conditions: covenant on leverage.\nSources: calc:leverage, policy:max_leverage\nApproved by you.`;
    say("Written after approval, never before.", "good");
    run.disabled = false;
    busy = false;
  }
  back.addEventListener("click", async () => {
    arm(false);
    node("review").classList.remove("wait");
    if (round >= 2) {
      memo.textContent = "Returned without approval after two rounds.\nNo memo was written.";
      say("The loop is bounded.", "bad");
      run.disabled = false;
      busy = false;
      return;
    }
    memo.textContent = "Sent back with your comment. The synthesizer runs again…";
    await toReview();
  });
}

// --------------------------------------------------------------- extract
const DOCS = [
  {
    title: "INVOICE",
    lines: [
      ["Supplier", "Northwind Supplies Ltd.", "supplier"],
      ["Tax ID", "4821963570", "tax_id"],
      ["Invoice no.", "INV-2026-0417", "number"],
      ["Date", "12 March 2026", "date"],
      ["Net", "8,530.06", "net"],
      ["VAT 10%", "853.01", "vat"],
      ["Total", "9,383.07 EUR", "total"],
    ],
    verdict: ["Accepted. Mapped to a posting record.", "good"],
  },
  {
    title: "FATURA",
    lines: [
      ["Satıcı", "Marmara Kimya Ltd. Şti.", "supplier"],
      ["Vergi No", "7310458826", "tax_id"],
      ["Fatura No", "FTR2026000981", "number"],
      ["Tarih", "09.03.2026", "date"],
      ["Ara Toplam", "12.400,00", "net"],
      ["KDV %20", "2.480,00", "vat"],
      ["Genel Toplam", "15.880,00 TL", "total"],
    ],
    flag: "total",
    verdict: ["To review: net + VAT is 14,880.00, not 15,880.00.", "bad"],
  },
  {
    title: "SEVK İRSALİYESİ",
    lines: [
      ["İrsaliye No", "IRS482211", "number"],
      ["Sevk Tarihi", "2026-03-10", "date"],
      ["Gönderen", "Kuzey Ambalaj A.Ş.", "sender"],
      ["Teslim Alan", "Ege Lojistik A.Ş.", "receiver"],
      ["Plaka", "34 ABC 123", "plate"],
      ["Kalem", "3", "items"],
    ],
    verdict: ["Accepted. Classified as a delivery note.", "good"],
  },
];

export function extract(root) {
  shell(
    root,
    "Extraction",
    "split · classify · extract · validate",
    `<div class="sheet-row"><div class="paper" data-paper></div><div class="fields" data-fields></div></div>`,
    `<button class="btn go" data-scan>Scan</button>
     <button class="btn" data-next>Next document</button>
     <span class="note" data-note></span>`,
  );
  const paper = root.querySelector("[data-paper]");
  const fields = root.querySelector("[data-fields]");
  const note = root.querySelector("[data-note]");
  const scanBtn = root.querySelector("[data-scan]");
  let index = 0;
  let busy = false;

  function show() {
    const doc = DOCS[index];
    paper.innerHTML = `<div class="scan"></div><h4>${doc.title}</h4>${doc.lines.map(([k, v, f]) => `<div>${k}: <span data-f="${f}">${v}</span></div>`).join("")}`;
    fields.innerHTML = "";
    note.textContent = `${index + 1} / ${DOCS.length}`;
    note.className = "note";
  }
  async function scan() {
    if (busy) return;
    busy = true;
    scanBtn.disabled = true;
    const doc = DOCS[index];
    fields.innerHTML = "";
    paper.querySelectorAll(".lit").forEach((el) => el.classList.remove("lit"));
    const bar = paper.querySelector(".scan");
    bar.style.opacity = 1;
    const total = 1300;
    bar.animate([{ transform: "translateY(0)" }, { transform: `translateY(${paper.clientHeight}px)` }], { duration: total, easing: "linear" });
    const spans = [...paper.querySelectorAll("[data-f]")];
    for (const [i, span] of spans.entries()) {
      await wait(total / (spans.length + 1));
      span.classList.add("lit");
      const row = document.createElement("div");
      if (doc.flag === doc.lines[i][2]) row.className = "flag";
      row.innerHTML = `<span>${doc.lines[i][2]}</span><span>${span.textContent}</span>`;
      fields.append(row);
      requestAnimationFrame(() => row.classList.add("on"));
    }
    await wait(total / (spans.length + 1));
    bar.style.opacity = 0;
    note.textContent = doc.verdict[0];
    note.className = `note ${doc.verdict[1]}`;
    scanBtn.disabled = false;
    busy = false;
  }
  scanBtn.addEventListener("click", scan);
  root.querySelector("[data-next]").addEventListener("click", () => {
    if (busy) return;
    index = (index + 1) % DOCS.length;
    show();
  });
  show();
}

// ---------------------------------------------------------------- dedupe
const HOURS = [
  [
    ["Northwind Supplies faces fraud probe over invoicing", "dailyledger", "keep crit"],
    ["Northwind Supplies faces fraud probe over invoicing", "dailyledger ?utm", "dup"],
    ["Northwind appoints new chief executive", "tradepress", "keep"],
    ["Northwind Supplies faces fraud probe over invoicing", "wirecopy", "dup"],
    ["Northwind Supplies share price and quote", "marketdata", "dup"],
    ["Marmara Kimya yeni fabrika yatırımını duyurdu", "sanayihaber", "keep"],
    ["Atlas Copco reports record orders", "tradepress", "dup"],
  ],
  [
    ["Northwind Supplies faces fraud probe over invoicing", "dailyledger", "dup"],
    ["Northwind appoints new chief executive", "tradepress", "dup"],
    ["Northwind Supplies sued by former distributor", "dailyledger", "keep"],
    ["Marmara Kimya yeni fabrika yatırımını duyurdu", "sanayihaber", "dup"],
  ],
  [
    ["Northwind Supplies faces fraud probe over invoicing", "wirecopy", "dup"],
    ["Northwind Supplies sued by former distributor", "dailyledger", "dup"],
    ["Northwind appoints new chief executive", "tradepress", "dup"],
  ],
];

export function dedupe(root) {
  shell(
    root,
    "News watch",
    "hourly · one digest",
    `<ul class="feed" data-feed></ul>
     <div class="tally">Fetched <b data-seen>0</b> Kept <b data-kept>0</b></div>`,
    `<button class="btn go" data-run>Run 08:00</button><span class="note" data-note></span>`,
  );
  const feed = root.querySelector("[data-feed]");
  const seen = root.querySelector("[data-seen]");
  const kept = root.querySelector("[data-kept]");
  const note = root.querySelector("[data-note]");
  const run = root.querySelector("[data-run]");
  let hour = 0;
  let totals = [0, 0];
  run.addEventListener("click", async () => {
    run.disabled = true;
    if (hour === 0) {
      feed.innerHTML = "";
      totals = [0, 0];
    }
    feed.querySelectorAll("li").forEach((li) => li.remove());
    note.textContent = "";
    let fresh = 0;
    for (const [title, source, kind] of HOURS[hour]) {
      const li = document.createElement("li");
      li.innerHTML = `<span>${title}</span><small>${source}</small>`;
      if (kind.includes("crit")) li.classList.add("crit");
      feed.append(li);
      totals[0] += 1;
      seen.textContent = totals[0];
      await wait(360);
      if (kind === "dup") li.classList.add("dup");
      else {
        fresh += 1;
        totals[1] += 1;
        kept.textContent = totals[1];
      }
    }
    await wait(700);
    note.textContent = fresh ? `Digest sent: ${fresh} new.` : "Nothing new. No e-mail.";
    note.className = `note ${fresh ? "good" : "bad"}`;
    hour = (hour + 1) % HOURS.length;
    run.textContent = `Run ${["08:00", "09:00", "10:00"][hour]}`;
    run.disabled = false;
  });
}

// ---------------------------------------------------------------- access
const LIBRARY = ["all", "all", "all", "all", "hr", "hr", "finance", "finance", "it", "it", "hr finance"];
const QUESTIONS = [
  { q: "What is the salary band for a senior engineer?", doc: 4, a: "95,000 to 130,000 TL per month.", source: "Salary Bands 2026" },
  { q: "Which invoices need the CFO's approval?", doc: 6, a: "Invoices above 250,000 TL.", source: "Payment Approval Limits" },
  { q: "How many days of annual leave in the first five years?", doc: 0, a: "14 days a year.", source: "Annual Leave Policy" },
];
const ROLES = [
  ["Any employee", ["all"]],
  ["HR", ["all", "hr"]],
  ["Finance", ["all", "finance"]],
  ["IT", ["all", "it"]],
];

export function access(root) {
  shell(
    root,
    "Who is asking",
    "filter before the model",
    `<div class="chips" data-roles>${ROLES.map(([name], i) => `<button class="chip${i === 0 ? " on" : ""}" data-role="${i}">${name}</button>`).join("")}</div>
     <p class="ask" data-q></p>
     <div class="docs" data-docs>${LIBRARY.map(() => "<i></i>").join("")}</div>
     <div class="answer" data-a></div>`,
    `<button class="btn" data-next>Another question</button><span class="note" data-note></span>`,
  );
  const docs = [...root.querySelectorAll("[data-docs] i")];
  const answer = root.querySelector("[data-a]");
  const note = root.querySelector("[data-note]");
  let role = 0;
  let question = 0;
  function render() {
    const groups = ROLES[role][1];
    const item = QUESTIONS[question];
    root.querySelector("[data-q]").textContent = item.q;
    let readable = 0;
    docs.forEach((el, i) => {
      const allowed = LIBRARY[i].split(" ").some((g) => groups.includes(g));
      readable += allowed;
      el.className = allowed ? (i === item.doc ? "hit" : "") : "off";
    });
    const allowed = LIBRARY[item.doc].split(" ").some((g) => groups.includes(g));
    answer.className = `answer ${allowed ? "yes" : "no"}`;
    answer.innerHTML = allowed
      ? `${item.a}<small>[1] ${item.source}</small>`
      : `I could not find this in the documents you have access to.<small>The model was not called.</small>`;
    note.textContent = `${readable} of ${LIBRARY.length} documents readable`;
  }
  root.querySelector("[data-roles]").addEventListener("click", (ev) => {
    const chip = ev.target.closest("[data-role]");
    if (!chip) return;
    role = Number(chip.dataset.role);
    root.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === chip));
    render();
  });
  root.querySelector("[data-next]").addEventListener("click", () => {
    question = (question + 1) % QUESTIONS.length;
    render();
  });
  render();
}
