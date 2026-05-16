# Architecture

This project starts as a static mobile-first web app.

## Current approach

```text
Browser / phone
  ↓
index.html
  ↓
Leaflet map + form
  ↓
sample GeoJSON / future public tree endpoint
  ↓
localStorage drafts
  ↓
CSV / GeoJSON export
```

## No backend in the first proof of concept

The first version deliberately avoids:

- user accounts,
- server-side database,
- central photo storage,
- direct Artportalen publishing,
- authentication flows.

This keeps the project cheap to test and easy to deploy on GitHub Pages.

## Current modules

| File | Purpose |
|---|---|
| `src/app.js` | Main application wiring and event handling. |
| `src/config.js` | App settings and export column order. |
| `src/map.js` | Leaflet map setup and marker rendering. |
| `src/tree-layer.js` | Loading and displaying existing tree records. |
| `src/form.js` | Form setup, field value loading and draft creation. |
| `src/storage.js` | Local draft persistence. |
| `src/duplicate-check.js` | Distance calculation and nearby-tree detection. |
| `src/export-csv.js` | CSV export. |
| `src/export-geojson.js` | GeoJSON export. |
| `src/gps.js` | Browser geolocation wrapper. |
| `src/util.js` | Shared helper functions. |

## Future backend option

A small proxy/backend may be needed if the chosen public data endpoint has CORS restrictions or requires request transformation.

Possible options:

- Cloudflare Worker,
- Netlify Function,
- Vercel Function,
- Python/FastAPI,
- Node.js/Express.

Backend should only be added when there is a confirmed need.
