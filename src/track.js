// Visit counts, sent to GoatCounter: one request per page view and one per thing worth knowing
// about (a section reached, a link followed). No cookies, nothing kept in the browser.
const ENDPOINT = "https://bahakirbasoglu.goatcounter.com/count";
const live = location.hostname === "bahakirbasoglu.com" && !navigator.webdriver && window === window.parent;

function send(fields) {
  if (!live) return;
  const query = new URLSearchParams({ ...fields, s: String(screen.width), b: "0", rnd: Math.random().toString(36).slice(2, 7) });
  const url = `${ENDPOINT}?${query}`;
  if (!navigator.sendBeacon?.(url)) new Image().src = url;
}

const once = new Set();
function event(name, title = name) {
  if (once.has(name)) return;
  once.add(name);
  send({ p: name, t: title, e: "true" });
}

const label = (el) => el.textContent.trim().replace(/\s+/g, " ").slice(0, 60);

export function track() {
  send({ p: location.pathname, t: document.title, r: document.referrer, q: location.search });

  // A section counts once its top third has crossed the middle of the screen.
  const reached = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reached.unobserve(entry.target);
        event(`section/${entry.target.id}`);
      }
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  document.querySelectorAll("section[id]").forEach((el) => reached.observe(el));

  addEventListener(
    "click",
    (ev) => {
      const link = ev.target.closest("a[href]");
      if (link) {
        const url = new URL(link.href, location.href);
        if (url.protocol === "mailto:") return event("contact/mail");
        if (url.protocol === "tel:") return event("contact/phone");
        if (url.host !== location.host) return event(`out/${url.host.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`, label(link));
        return;
      }
      const tab = ev.target.closest(".case-tab");
      if (tab) return event(`case/${label(tab.querySelector(".t"))}`);
      if (ev.target.closest("#toy-game [data-start]")) return event("game/start");
      if (ev.target.closest("#toggle-theme")) return event("theme/toggle");
    },
    { capture: true },
  );
}
