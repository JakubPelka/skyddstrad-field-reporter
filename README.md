# Skyddsträd Field Reporter

**Status:** Idea / Proof of Concept planned  
**Repository type:** Experimental field-tool concept  
**Target platform:** Mobile-first web app / PWA  
**Primary use case:** Field recording of potential *särskilt skyddsvärda träd* and preparation of structured data for later import into Artportalen.

---

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

---

## Background

Today, reporting *särskilt skyddsvärda träd* with project-specific parameters is mainly handled through Artportalen and its dedicated reporting/import workflows.

For field users, especially on mobile devices, this can be less convenient when recording many trees outdoors. A small mobile-first tool could reduce friction by allowing users to collect structured observations directly in the field and prepare them for later import.

A key idea is also to show already reported trees nearby, so users can avoid creating duplicate records.

---

## Important disclaimer

This project is **not an official SLU, ArtDatabanken, Artportalen, or Länsstyrelsen application**.

It is an independent experimental tool concept intended to support field data collection and preparation of import-ready data.

Any final implementation must respect:

- Artportalen's official reporting rules,
- relevant API terms and usage limits,
- data licenses,
- personal data and photo handling requirements,
- quality requirements for biodiversity and tree inventory data.

---

## Core concept

The intended workflow is:

1. The user opens the mobile web app in the field.
2. The app reads the user's GPS position.
3. The map displays already reported *skyddsvärda träd* nearby.
4. The user checks whether the tree is already known.
5. The user records a new tree or prepares an update/comment.
6. The observation is stored locally on the device as a draft.
7. The user exports the collected records as CSV/XLSX/GeoJSON.
8. The exported file is reviewed and imported into Artportalen using the official workflow.

---

## MVP scope

The first version should be deliberately small.

### Included in MVP

| Feature | Description |
|---|---|
| Mobile-first map | Simple map optimized for phone use in the field. |
| GPS position | Show current user position and GPS accuracy. |
| Existing tree layer | Display nearby already reported *skyddsvärda träd*. |
| Tree form | Basic structured form for recording a tree. |
| Duplicate warning | Warn if another tree exists within a configurable distance. |
| Local draft storage | Store observations locally before export. |
| Export | Export records to CSV/XLSX and GeoJSON. |
| Basic validation | Check required fields and obvious value errors. |

### Not included in MVP

| Feature | Reason |
|---|---|
| Direct upload to Artportalen | Requires official write access/API workflow and should not be assumed. |
| User accounts | Avoid unnecessary complexity in the first version. |
| Full offline map support | Useful later, but not needed for a first proof of concept. |
| Automatic species identification | Interesting future feature, but not needed for MVP. |
| Editing official Artportalen records | Outside the scope of an independent MVP. |

---

## Suggested data sources

The application should investigate and use official or reliable public data sources where possible.

Potential sources include:

- SLU / ArtDatabanken open data and APIs  
  <https://www.slu.se/artdatabanken/rapportering-och-fynd/oppna-data-och-apier/>

- SLU Species Observation System API / WFS  
  <https://github.com/biodiversitydata-se/SOS>

- Länsstyrelsernas Geodatakatalogen layer for **SLU Skyddsvärda träd - Artportalen**  
  <https://ext-geodatakatalog.lansstyrelsen.se/>

- Artportalen reporting help and import templates  
  <https://www.slu.se/artdatabanken/rapportering-och-fynd/artportalen/>

The exact endpoint, layer name, request format, license text, update frequency and attribute structure must be verified during implementation.

---

## Existing records on the map

A central feature is to display already reported trees near the user's position.

The map should support:

- loading existing trees within the current map extent or search radius,
- clustering points if many records are visible,
- showing a popup with key attributes,
- linking to the original record if a public URL is available,
- filtering by tree species or status if supported by the data source.

The app should treat existing records as context data only. It should not assume that the displayed layer is complete, fully up to date, or editable.

---

## Duplicate detection

When the user creates a new observation, the app should check for nearby existing trees.

Example logic:

```text
If an existing tree is found within 20 metres:
    Show a warning.
    Display the nearby existing records.
    Let the user decide whether:
        - this is a new tree,
        - this is probably the same tree,
        - this should be handled as an update/comment instead.
```

The duplicate threshold should be configurable, for example:

- 10 m for high-accuracy GPS,
- 20 m as default,
- 30–50 m when GPS accuracy is poor.

Duplicate detection should be treated as a warning, not as an automatic block.

---

## Suggested form fields

The exact field list must be adjusted to the official Artportalen import template and the current structure for the *Skyddsvärda träd* project.

Possible MVP fields:

| Field | Notes |
|---|---|
| Species | Swedish name and/or scientific name. |
| Latitude | From GPS or manually adjusted map point. |
| Longitude | From GPS or manually adjusted map point. |
| Coordinate accuracy | GPS accuracy in metres. |
| Stem circumference | Usually recorded in centimetres. |
| Tree status | Living, dead, fallen, etc. depending on official values. |
| Hollow stage / hålstadium | Should follow official value list. |
| Hollow position / hålets placering | Should follow official value list. |
| Vitality | Especially relevant for living trees. |
| Management need / åtgärdsbehov | Should follow official value list. |
| Comment | Free text. |
| Photo reference | Local photo filename or attachment reference. |
| Observer | Optional, depending on workflow. |
| Date | Observation date. |

The app should avoid inventing its own classification system if Artportalen already has controlled values.

---

## Exports

The app should support at least two export formats.

### CSV/XLSX

Primary export format for later import or manual processing.

The column names and allowed values should be aligned with the official Artportalen import template for *skyddsvärda träd*.

### GeoJSON

Useful for GIS review in QGIS, ArcGIS, FME, PostGIS or municipal GIS workflows.

GeoJSON export should include geometry and all relevant attributes.

---

## Privacy and data handling

The first version should avoid server-side storage.

Recommended MVP approach:

- observations are stored locally in the browser,
- photos stay on the user's device unless exported,
- no user tracking,
- no analytics by default,
- no login,
- no central database.

If server-side storage is added later, the project must handle:

- personal data,
- observer names,
- photo metadata,
- GPS locations,
- access control,
- deletion routines,
- backup and retention.

---

## Technical direction

Recommended MVP technology:

- static web app / PWA,
- HTML, CSS and JavaScript or TypeScript,
- Leaflet or MapLibre for map display,
- IndexedDB or local storage for drafts,
- client-side CSV/GeoJSON export,
- optional XLSX export library,
- optional small proxy service if CORS or API limitations require it.

Possible later backend options:

- Cloudflare Worker,
- Netlify Function,
- Vercel Function,
- small Python/FastAPI service,
- Node.js/Express service.

The first version should avoid backend complexity unless it is required for data access.

---

## Possible repository structure

```text
skyddstrad-field-reporter/
  README.md
  LICENSE
  .gitignore
  index.html
  src/
    app.js
    map.js
    gps.js
    tree-layer.js
    duplicate-check.js
    form.js
    storage.js
    export-csv.js
    export-geojson.js
  data/
    species.json
    form-values.json
  docs/
    data-sources.md
    artportalen-import.md
    limitations.md
```

---

## Known limitations

This project has several important limitations.

1. **No direct reporting in the first version**  
   The MVP should not publish directly to Artportalen. It should only prepare data for later import.

2. **Public data may be incomplete**  
   Not all records may be visible through public APIs or public geodata services.

3. **Sensitive records may be hidden or generalized**  
   Some biodiversity data may be protected, filtered or spatially generalized.

4. **GPS accuracy varies**  
   Mobile GPS can be unreliable under tree canopy, near buildings or in poor weather conditions.

5. **Duplicate detection is uncertain**  
   A nearby point does not always mean the same tree, and missing nearby points do not guarantee that the tree is new.

6. **Official import format may change**  
   The export module must be updated if Artportalen changes its import template or allowed values.

7. **Data source availability may change**  
   APIs, WFS services, geodata layers and CORS behaviour may change over time.

8. **Not a validation authority**  
   The app can help structure field data, but it cannot guarantee ecological, taxonomic or legal correctness.

---

## Future ideas

Potential future development:

- offline basemaps,
- automatic background sync,
- photo attachment export,
- direct integration with a municipal GIS database,
- QGIS import workflow,
- FME workflow for validation and transformation,
- AI-assisted species suggestions from photos,
- AI-assisted form completion from voice notes,
- local checklist of valuable tree criteria,
- comparison with historical records,
- support for updating existing records,
- role-based workflows for municipalities,
- Swedish user interface,
- English user interface,
- Polish developer notes if useful.

---

## Suggested first implementation steps

1. Verify the current official import template for *Skyddsvärda träd*.
2. Identify the best public endpoint for existing tree records.
3. Build a minimal map page with GPS.
4. Load nearby existing tree points.
5. Add a simple form for one new tree.
6. Store drafts locally.
7. Export GeoJSON.
8. Export CSV compatible with the import template.
9. Add duplicate warning.
10. Test in the field.

---

## Project status

Current status: **idea / proof of concept planned**.

This README describes the intended direction and design assumptions. The technical implementation has not yet been completed.

---

## License

License not decided yet.

For an open public helper tool, a permissive license such as MIT may be suitable. However, the final license should be selected after checking dependencies, data source terms and intended reuse.

---

## Working title

**Skyddsträd Field Reporter**

Alternative names:

- `skyddstrad-field-reporter`
- `skyddstrad-reporter`
- `tree-field-reporter`
- `valuable-tree-field-reporter`

The name should avoid implying that the tool is an official Artportalen or SLU product.
