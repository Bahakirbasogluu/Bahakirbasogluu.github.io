# Site

Personal site of Baha Kırbaşoğlu. One page; a particle form on a fixed WebGL stage takes the shape of whatever the section in view is about, and each section carries a small working model of the pattern it names.

```bash
npm install
npm run dev      # http://localhost:5183
npm run build    # static output in dist/
```

- `src/scene.js` the stage: seven point-cloud forms and the morph between them
- `src/toys.js` approval gate, extraction, news watch, permission lens
- `src/game.js` find the lesions
- `src/main.js` scroll mapping, command menu (Cmd+K or /), lesson mode (T), theme
- `src/style.css` type, layout, panels

No backend, no tracking, no external requests. The font is Archivo (SIL Open Font License), self-hosted.
