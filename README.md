# Skyddsträd Field Reporter

**Status:** Idea / Proof of Concept planned  
**Repository type:** Experimental field-tool concept  
**Target platform:** Mobile-first web app / PWA  
**Primary use case:** Field recording of potential *särskilt skyddsvärda träd* and preparation of structured data for later import into Artportalen.

—

## Purpose

Skyddsträd Field Reporter is a lightweight concept for a mobile-friendly field tool that helps users record potential **särskilt skyddsvärda träd** in the field.

The main goal is to make field collection easier by combining:

- a simple mobile form,
- GPS-based positioning,
- a map showing already reported trees nearby,
- duplicate warnings,
- local draft storage,
- export to a structured file that can later be imported into Artportalen.

The project is intended as a practical helper tool, not as a replacement for Artportalen.

—

## Important disclaimer

This project is **not an official SLU, ArtDatabanken, Artportalen, or Länsstyrelsen application**.

It is an independent experimental tool concept intended to support field data collection and preparation of import-ready data.

Any final implementation must respect:

- Artportalen’s official reporting rules,
- relevant API terms and usage limits,
- data licenses,
- personal data and photo handling requirements,
- quality requirements for biodiversity and tree inventory data.

—

## Current proof-of-concept

This repository currently contains a minimal static web app scaffold.

It can already:

- display a mobile-friendly map,
- use browser geolocation,
- show sample existing tree records,
- let the user place a new tree point on the map,
- fill in a basic tree form,
- warn about possible duplicates near the selected point,
- store draft observations locally in the browser,
- export drafts as CSV,
- export drafts as GeoJSON.

The sample data and form values are placeholders. They must be replaced or aligned with official Artportalen import templates and confirmed data sources before real use.

—

## Suggested workflow

1. Open the app in the field.
2. Let the app read the GPS position.
3. Check if nearby *skyddsvärda träd* are already shown on the map.
4. Place or adjust the point for a new observation.
5. Fill in the form.
6. Save the observation as a local draft.
7. Export drafts to CSV or GeoJSON.
8. Review and transform the file before import into Artportalen.

The MVP does **not** publish directly to Artportalen.

—

## Running locally

Because the app uses JavaScript modules and browser geolocation, it should be opened through a local web server, not directly as a `file://` path.

Simple option:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

For phone testing, GitHub Pages is usually more convenient because browser geolocation normally requires HTTPS.

—

## Repository structure

```text
skyddstrad-field-reporter/
  README.md
  LICENSE
  .gitignore
  .gitattributes
  index.html
  manifest.webmanifest
  src/
    app.js
    config.js
    duplicate-check.js
    export-csv.js
    export-geojson.js
    form.js
    gps.js
    map.js
    storage.js
    tree-layer.js
    util.js
  styles/
    main.css
  data/
    existing-trees.sample.geojson
    form-values.json
    species.json
  docs/
    architecture.md
    artportalen-import.md
    data-sources.md
    limitations.md
```

—

## MVP scope

### Included in the current scaffold

| Feature | Status |
|—|—|
| Mobile-first map | Basic implementation |
| GPS position | Basic implementation |
| Existing tree layer | Sample GeoJSON only |
| Tree form | Basic placeholder fields |
| Duplicate warning | Basic distance-based check |
| Local draft storage | Browser localStorage |
| CSV export | Basic implementation |
| GeoJSON export | Basic implementation |

### Not included yet

| Feature | Reason |
|—|—|
| Direct upload to Artportalen | Requires official write access/API workflow and should not be assumed. |
| Official import template mapping | Must be verified against the current Artportalen template. |
| Live Artportalen/geodata endpoint | Requires endpoint verification and CORS testing. |
| Photo export | Needs a careful decision about file handling and privacy. |
| User accounts | Avoided in the first proof of concept. |
| Full offline map support | Useful later, but not needed for the first test. |

—

## Data source strategy

The app should eventually show existing *skyddsvärda träd* from a public and reliable data source.

Potential data sources to verify:

- SLU / ArtDatabanken open data and APIs
- SLU Species Observation System API / WFS
- Länsstyrelsernas Geodatakatalogen layer for **SLU Skyddsvärda träd - Artportalen**
- Artportalen reporting help and import templates

The current code uses only `data/existing-trees.sample.geojson`.

The real endpoint should be configured in `src/config.js` after testing.

—

## Duplicate detection

When the user selects a location, the app compares it with loaded existing tree points.

Default threshold:

```text
20 metres
```

This is only a warning. It should not block the user from saving a record.

Possible future logic:

- use 10 m for high-accuracy GPS,
- use 20 m as default,
- use 30–50 m when GPS accuracy is poor,
- compare species and stem circumference when available.

—

## Suggested form fields

The exact field list must be adjusted to the official Artportalen import template and the current structure for the *Skyddsvärda träd* project.

Current placeholder fields:

- species,
- latitude,
- longitude,
- coordinate accuracy,
- stem circumference,
- tree status,
- hollow stage / `hålstadium`,
- hollow position / `hålets placering`,
- vitality,
- management need / `åtgärdsbehov`,
- observer,
- observation date,
- comment.

The app should avoid inventing its own classification system if Artportalen already has controlled values.

—

## Privacy and local storage

The current scaffold stores drafts locally in the browser using `localStorage`.

This means:

- no server-side storage,
- no login,
- no central database,
- no automatic upload,
- data remains on the current device/browser until exported or cleared.

This is useful for a simple MVP, but not a complete long-term data management solution.

—

## Known limitations

1. The existing-tree layer uses sample data.
2. No direct reporting to Artportalen is implemented.
3. Field names and value lists are placeholders.
4. Browser GPS accuracy varies.
5. Duplicate detection is approximate.
6. CSV export is not yet guaranteed to match Artportalen’s import template.
7. Photos are not handled in the first scaffold.
8. Public data sources may hide or generalize sensitive observations.
9. The app should be tested on real mobile devices before any field use.

See `docs/limitations.md` for more details.

—

## License

The code in this repository is released under the MIT License unless stated otherwise.

Data sources, map tiles, APIs and external services may have their own licenses and terms.

—

## Working title

**Skyddsträd Field Reporter**

The name should avoid implying that the tool is an official Artportalen or SLU product.