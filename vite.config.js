import { defineConfig } from "vite";
import { FILL } from "./src/markup.js";

// Write the content-driven sections into index.html at build time, so the text is in the page
// source for search engines and for anyone reading without scripts.
const prerender = {
  name: "prerender-sections",
  transformIndexHtml(html) {
    if (!html.includes('id="work-index"')) return html; // other local pages are left alone
    for (const [id, render] of Object.entries(FILL)) {
      const empty = new RegExp(`(id="${id}"[^>]*>)(</)`);
      if (!empty.test(html)) throw new Error(`No empty container with id="${id}" in index.html`);
      html = html.replace(empty, (_, open, close) => open + render() + close);
    }
    return html;
  },
};

export default defineConfig({ plugins: [prerender] });
