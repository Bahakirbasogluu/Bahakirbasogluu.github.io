# Site

Personal site of Baha Kırbaşoğlu. One page; a particle form on a fixed WebGL stage takes the shape of whatever the section in view is about, and each section carries a small working model of the pattern it names.

```bash
npm install
npm run dev      # http://localhost:5183
npm run build    # static output in dist/
```

- `src/scene.js` the stage: ten point-cloud forms, the morph between them, a ripple and a focus highlight
- `src/content.js` everything the page says about the work: engagements, programmes, path, repositories
- `src/sections.js` the parts built from that content: case explorer, teaching panel, path, facts, filterable index
- `src/toys.js` approval gate, extraction, news watch, permission lens
- `src/game.js` find the lesions
- `src/main.js` scroll mapping, command menu (Cmd+K or /), lesson mode (T), theme
- `src/track.js` visit and click counts
- `src/style.css`, `src/sections.css` type, layout, panels

No backend. Visits are counted with GoatCounter, without cookies; nothing else leaves the page. The font is Archivo (SIL Open Font License), self-hosted.
