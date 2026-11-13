// Find the lesions: a synthetic PET projection, a clock, and an honest scorecard.
// Everything is generated; no patient data is involved.
const W = 400;
const H = 500;
const SECONDS = 25;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Body outline as soft ellipses: [cx, cy, rx, ry, level]
const BODY = [
  [200, 62, 38, 46, 0.2], [200, 116, 17, 16, 0.18], [200, 205, 84, 92, 0.2], [200, 318, 76, 60, 0.2],
  [103, 200, 19, 78, 0.16], [297, 200, 19, 78, 0.16], [162, 420, 31, 86, 0.17], [238, 420, 31, 86, 0.17],
]; // prettier-ignore
// Physiological uptake: bright, expected, and not a finding. [cx, cy, rx, ry, level, name]
const ORGANS = [
  [200, 58, 30, 36, 0.95, "brain"], [221, 190, 20, 22, 0.62, "heart"], [168, 268, 13, 18, 0.55, "kidney"],
  [232, 268, 13, 18, 0.55, "kidney"], [200, 352, 18, 15, 0.98, "bladder"], [176, 232, 34, 22, 0.3, "liver"],
]; // prettier-ignore
const SIZES = [
  ["small", 2.6, 0.5], ["small", 2.9, 0.55], ["small", 3.1, 0.55], ["small", 3.4, 0.6],
  ["medium", 5.2, 0.78], ["medium", 6.0, 0.82], ["medium", 6.8, 0.85],
  ["large", 10.5, 0.95], ["large", 13, 0.98],
]; // prettier-ignore

function inside(x, y, e, pad = 0) {
  return ((x - e[0]) / (e[2] + pad)) ** 2 + ((y - e[1]) / (e[3] + pad)) ** 2 < 1;
}

function layout(seed) {
  const rand = rng(seed);
  const lesions = [];
  for (const [band, r, level] of SIZES) {
    for (let tries = 0; tries < 400; tries++) {
      const region = BODY[[2, 2, 3, 3, 1, 4, 5, 6, 7][Math.floor(rand() * 9)]];
      const x = region[0] + (rand() * 2 - 1) * region[2] * 0.8;
      const y = region[1] + (rand() * 2 - 1) * region[3] * 0.8;
      if (!inside(x, y, region, -r - 2)) continue;
      if (ORGANS.some((o) => inside(x, y, o, r + 7))) continue;
      if (lesions.some((l) => Math.hypot(l.x - x, l.y - y) < l.r + r + 16)) continue;
      lesions.push({ x, y, r, band, level, found: false });
      break;
    }
  }
  return lesions;
}

function paint(ctx, lesions, seed) {
  const rand = rng(seed * 7 + 1);
  const field = new Float32Array(W * H);
  const blob = (cx, cy, rx, ry, level, soft) => {
    const x0 = Math.max(0, Math.floor(cx - rx * 2.2));
    const x1 = Math.min(W - 1, Math.ceil(cx + rx * 2.2));
    const y0 = Math.max(0, Math.floor(cy - ry * 2.2));
    const y1 = Math.min(H - 1, Math.ceil(cy + ry * 2.2));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
        const v = soft ? Math.exp(-d * d * 1.1) : 1 / (1 + Math.exp((d - 1) * 9));
        const i = y * W + x;
        field[i] = Math.max(field[i], v * level);
      }
    }
  };
  BODY.forEach((b) => blob(b[0], b[1], b[2], b[3], b[4], false));
  ORGANS.forEach((o) => blob(o[0], o[1], o[2], o[3], o[4], true));
  lesions.forEach((l) => blob(l.x, l.y, l.r, l.r, l.level, true));
  const image = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const grain = (rand() - 0.5) * 0.11 * (field[i] > 0.02 ? 1 : 0.25);
    const v = Math.max(0, Math.min(1, field[i] + grain));
    const g = Math.pow(v, 0.85) * 255;
    image.data.set([g * 0.96, g * 0.95, g * 0.9, 255], i * 4);
  }
  ctx.putImageData(image, 0, 0);
}

export function game(root) {
  root.append(
    document.createRange().createContextualFragment(`
      <div class="bench-head"><b>Find the lesions</b><span class="hud" data-hud>${SECONDS}.0 s</span></div>
      <div class="bench-body">
        <div class="viewer" data-viewer>
          <canvas width="${W}" height="${H}" data-view></canvas>
          <div class="over" data-over>
            <h3>${SECONDS} seconds.</h3>
            <p>Click every lesion you can find. Brain, heart, kidneys and bladder light up in every scan; they do not count.</p>
            <button class="btn go" data-start>Start</button>
          </div>
        </div>
      </div>
      <div class="bench-foot"><span class="note" data-note style="margin-left:0;text-align:left">Synthetic image. No patient data.</span></div>`),
  );
  const canvas = root.querySelector("[data-view]");
  const ctx = canvas.getContext("2d");
  const base = document.createElement("canvas");
  base.width = W;
  base.height = H;
  const over = root.querySelector("[data-over]");
  const hud = root.querySelector("[data-hud]");
  let lesions = [];
  let marks = [];
  let playing = false;
  let ends = 0;
  let round = 0;
  let clock = 0;

  function draw(reveal = false) {
    ctx.drawImage(base, 0, 0);
    ctx.lineWidth = 1.4;
    for (const m of marks) {
      ctx.strokeStyle = reveal ? (m.hit ? "#ff5a3c" : "rgba(237,234,227,.55)") : "#edeae3";
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.stroke();
      if (reveal && !m.hit) {
        ctx.beginPath();
        ctx.moveTo(m.x - 4, m.y - 4);
        ctx.lineTo(m.x + 4, m.y + 4);
        ctx.moveTo(m.x + 4, m.y - 4);
        ctx.lineTo(m.x - 4, m.y + 4);
        ctx.stroke();
      }
    }
    if (reveal) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "#ff5a3c";
      for (const l of lesions.filter((x) => !x.found)) {
        ctx.beginPath();
        ctx.arc(l.x, l.y, Math.max(l.r + 5, 9), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }

  function start() {
    round += 1;
    lesions = layout(round * 97 + 11);
    marks = [];
    paint(base.getContext("2d"), lesions, round);
    draw();
    over.hidden = true;
    playing = true;
    ends = performance.now() + SECONDS * 1000;
    clearInterval(clock);
    clock = setInterval(tick, 100);
    tick();
  }

  function tick() {
    if (!playing) return;
    const left = Math.max(0, (ends - performance.now()) / 1000);
    hud.textContent = `${left.toFixed(1)} s`;
    if (left <= 0 || lesions.every((l) => l.found)) finish();
  }

  function finish() {
    playing = false;
    clearInterval(clock);
    draw(true);
    const bands = ["small", "medium", "large"].map((band) => {
      const all = lesions.filter((l) => l.band === band);
      return [band, all.filter((l) => l.found).length, all.length];
    });
    const falsePositives = marks.filter((m) => !m.hit).length;
    const area = (r) => Math.PI * r * r;
    const truth = lesions.reduce((s, l) => s + area(l.r), 0);
    const overlap = lesions.filter((l) => l.found).reduce((s, l) => s + area(l.r), 0);
    const predicted = overlap + falsePositives * area(6);
    const dice = predicted + truth ? (2 * overlap) / (predicted + truth) : 0;
    const small = bands[0];
    const verdict =
      small[1] === small[2] && falsePositives === 0
        ? "You found all of them. Models rarely do."
        : dice > 0.6 && small[1] < small[2]
          ? `A Dice of ${dice.toFixed(2)} looks fine. It missed ${small[2] - small[1]} of ${small[2]} small lesions.`
          : `Dice alone says ${dice.toFixed(2)}. The rows above say where.`;
    over.innerHTML = `
      <h3>Dice ${dice.toFixed(2)}</h3>
      <div class="bars">
        ${bands.map(([band, hit, all]) => `<div><span>${band}</span><s style="--w:0%" data-w="${(hit / all) * 100}"></s><span>${hit}/${all}</span></div>`).join("")}
        <div><span>false +</span><s style="--w:0%" data-w="${Math.min(falsePositives, 8) * 12.5}"></s><span>${falsePositives}</span></div>
      </div>
      <p>${verdict}</p>
      <button class="btn go" data-start>Play again</button>`;
    over.hidden = false;
    over.style.background = "rgba(11,11,11,.86)";
    setTimeout(() => over.querySelectorAll("[data-w]").forEach((el) => el.style.setProperty("--w", `${el.dataset.w}%`)), 30);
    hud.textContent = "0.0 s";
  }

  canvas.addEventListener("pointerdown", (ev) => {
    if (!playing) return;
    const box = canvas.getBoundingClientRect();
    const x = ((ev.clientX - box.left) / box.width) * W;
    const y = ((ev.clientY - box.top) / box.height) * H;
    const target = lesions.find((l) => !l.found && Math.hypot(l.x - x, l.y - y) <= Math.max(l.r * 1.7, 9));
    if (target) {
      target.found = true;
      marks.push({ x: target.x, y: target.y, r: Math.max(target.r + 4, 8), hit: true });
    } else {
      marks.push({ x, y, r: 8, hit: false });
    }
    draw();
  });
  over.addEventListener("click", (ev) => ev.target.closest("[data-start]") && start());

  paint(base.getContext("2d"), layout(5), 0);
  draw();
  return { start };
}
