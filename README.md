# Fältrapportör för skyddsvärda träd

**Status:** Early proof of concept  
**Repository type:** Experimental field-tool concept  
**Target platform:** Mobile-first static web app / PWA  
**Primary use case:** Field recording of potential *särskilt skyddsvärda träd* and preparation of structured data for later import into Artportalen.

---

## Purpose

This repository contains an experimental mobile-first field tool for recording potential **särskilt skyddsvärda träd**.

The app is intended to help users collect structured field notes, check nearby existing tree points, save local drafts and export the records for later processing/import.

It is **not** intended to replace Artportalen and it does **not** publish observations directly to Artportalen.

---

## Current proof of concept

The current app can:

- display a mobile-friendly map using MapLibre GL JS,
- use browser geolocation,
- show sample existing tree records near Simlångsdalen,
- let the user place a new tree point on the map,
- fill in a Swedish field form,
- warn about possible duplicate records near the selected point,
- store drafts locally in the browser,
- export drafts as XLSX,
- export drafts as GeoJSON.

The current value lists and export columns are still a working draft. They must be aligned with the official Artportalen import template before real use.

---

## Display name

The app currently uses the Swedish display name:

```text
Fältrapportör för skyddsvärda träd
```

The name should not imply that this is an official SLU, ArtDatabanken or Artportalen application.

---

## Important disclaimer

This project is **not an official SLU, ArtDatabanken, Artportalen or Länsstyrelsen application**.

It is an independent experimental tool concept intended to support field data collection and preparation of import-ready data.

Any final implementation must respect:

- Artportalen's official reporting rules,
- current import template requirements,
- relevant API terms and usage limits,
- data licenses,
- personal data and photo handling requirements,
- quality requirements for biodiversity and tree inventory data.

---

## Artportalen import template

A reference copy of the Artportalen tree project import template is stored in:

```text
docs/ap2_template_treeproject.xlsx
```

This template should be treated as the **source of truth** for:

- required columns,
- accepted values,
- controlled value classes,
- import structure,
- future XLSX mapping.

The current app does not yet parse the template automatically. The next development step should be to map the app's internal fields to the exact template columns and allowed values.

---

## Lokalnamn

`Lokalnamn` is a known challenge.

In Artportalen, `Lokalnamn` should refer to an existing locality/site. It should not be invented freely by the app.

Current MVP handling:

- the app has a manual `Lokalnamn` field,
- the user must enter the exact locality name expected by the later import workflow,
- the app does not yet validate whether the locality exists in Artportalen,
- the app does not auto-generate locality names from coordinates.

Future handling should investigate:

- lookup/search of existing Artportalen localities,
- a controlled local list for known project localities,
- validation before export,
- warning when `Lokalnamn` is empty or unknown.

---

## Suggested workflow

1. Open the app in the field.
2. Use GPS or tap the map to set the observation point.
3. Check if sample/existing tree records are nearby.
4. Fill in the Swedish field form.
5. Enter `Lokalnamn` according to the intended Artportalen import workflow.
6. Save the observation as a local draft.
7. Export drafts as XLSX or GeoJSON.
8. Review and transform the XLSX against the official Artportalen template before import.

The MVP does **not** publish directly to Artportalen.

---

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

For phone/iPad testing, GitHub Pages is usually more convenient because browser geolocation normally requires HTTPS.

---

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
    export-xlsx.js
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
    ap2_template_treeproject.xlsx
    architecture.md
    artportalen-import.md
    data-sources.md
    limitations.md
```

---

## MVP scope

### Included in the current scaffold

| Feature | Status |
|---|---|
| Mobile-first map | Working with MapLibre GL JS |
| GPS position | Basic implementation |
| Existing tree layer | Sample GeoJSON only |
| Swedish UI | Basic implementation |
| Tree form | Basic placeholder fields |
| Lokalnamn field | Manual field, no validation yet |
| Duplicate warning | Basic distance-based check |
| Local draft storage | Browser localStorage |
| XLSX export | Basic implementation, not yet exact Artportalen template mapping |
| GeoJSON export | Basic implementation |

### Not included yet

| Feature | Reason |
|---|---|
| Direct upload to Artportalen | Requires official write access/API workflow and should not be assumed. |
| Exact template-based XLSX export | Requires mapping against `docs/ap2_template_treeproject.xlsx`. |
| Automatic allowed-value extraction | The template needs to be parsed and mapped first. |
| Lokalnamn lookup/validation | Needs a reliable source for existing Artportalen localities. |
| Live Artportalen/geodata endpoint | Requires endpoint verification and CORS testing. |
| Photo export | Needs a careful decision about file handling and privacy. |
| User accounts | Avoided in the first proof of concept. |
| Full offline map support | Useful later, but not needed for the first test. |

---

## Data source strategy

The app should eventually show existing *skyddsvärda träd* from a public and reliable data source.

Potential data sources to verify:

- SLU / ArtDatabanken open data and APIs,
- SLU Species Observation System API / WFS,
- Länsstyrelsernas Geodatakatalogen layer for **SLU Skyddsvärda träd - Artportalen**,
- Artportalen reporting help and import templates.

The current code uses only:

```text
data/existing-trees.sample.geojson
```

The real endpoint should be configured in `src/config.js` after testing.

---

## Known limitations

1. The existing-tree layer uses sample data.
2. No direct reporting to Artportalen is implemented.
3. Field names and value lists are placeholders.
4. XLSX export is not yet guaranteed to match Artportalen's import template.
5. `Lokalnamn` is not validated against Artportalen localities.
6. Browser GPS accuracy varies.
7. Duplicate detection is approximate.
8. Photos are not handled in the first scaffold.
9. Public data sources may hide or generalize sensitive observations.
10. The app should be tested on real mobile devices before any field use.

---

## License

The code in this repository is released under the MIT License unless stated otherwise.

Data sources, map tiles, APIs, Artportalen templates and external services may have their own licenses and terms.
