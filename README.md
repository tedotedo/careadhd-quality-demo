# Routine data, better care: concept demo

A concept demonstration prepared by Dr Mark Aszkenasy for discussion with Care ADHD (October 2026).
It is **not** an official Care ADHD website.

**All data are synthetic**, generated in the browser by `js/app.js` and `js/audit.js` with seeded random number generators.
No real patient information is used anywhere. Targets and clinical thresholds are illustrative.

- `index.html`: the story, eight full-screen scenes (`css/story.css`, `js/story.js`). Presenter keys: → / ← / space / Page Up / Page Down move between scenes, F for full screen.
- `explore/`: the detail, one topic per page (`css/style.css`, `css/explore.css`).
- `js/mapdots.js`: dotted map generated at build time from Natural Earth land data (public domain, via world-atlas).

Static site that works offline. Chart.js and the Sankey plugin are bundled in `vendor/`. Fonts load from Google Fonts when online.
