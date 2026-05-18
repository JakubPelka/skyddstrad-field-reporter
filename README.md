# Fältrapportör för skyddsvärda träd

**Status:** Early proof of concept  
**Target platform:** Mobile-first web app / PWA  
**Map engine:** MapLibre GL JS  
**Primary use case:** Field recording of potential *särskilt skyddsvärda träd* and export of draft observations for later review/import into Artportalen.

## Purpose

This project is an experimental mobile field helper for recording potential **särskilt skyddsvärda träd**.

It is intended to help with:

- GPS-based field positioning,
- showing existing tree records from public tree layers,
- recording tree observations in a Swedish UI,
- suggesting existing `Lokalnamn` candidates,
- using municipality name as a fallback locality candidate,
- saving local drafts in the browser,
- exporting drafts as XLSX and GeoJSON.

The project is not a replacement for Artportalen and does not publish observations directly.

## Important disclaimer

This is **not an official SLU, ArtDatabanken, Artportalen or Länsstyrelsen application**.

Code and issue tracking are available on GitHub:

- Repository: https://github.com/JakubPelka/skyddstrad-field-reporter
- Issues: https://github.com/JakubPelka/skyddstrad-field-reporter/issues

Issues are welcome. I will try to look at them without unnecessary delay.

All exported data must be reviewed before import into Artportalen.

## Current implementation

The app currently uses:

- MapLibre GL JS for the map,
- OpenStreetMap raster tiles for the background map,
- public ArcGIS tree layers from SLU as context data,
- local SCB municipality boundaries as fallback for locality names,
- localStorage for drafts,
- SheetJS/xlsx for XLSX export,
- `data/TaxonList.csv` as the local taxon/autocomplete source.

## Field workflow

The form is intentionally split into two parts:

1. **Grunduppgifter** – the most important fields shown immediately.
2. **Ytterligare attribut** – optional project parameters in a collapsible section.

This keeps the mobile UI usable in the field while still supporting Artportalen project parameters when needed.

## Art and scientific name

The app uses:

```text
data/TaxonList.csv
```

as the local source for the `Artnamn` and `Vetenskapligt namn` autocomplete fields.

Current UI behavior:

- typing `Skogsek` fills `Quercus robur`,
- typing `Quercus robur` fills `Skogsek`,
- if the value is not found in the local taxon list, the app warns the user to check before import.

The user is still responsible for identifying the species. The app should not infer species from nearby tree records.

The parser supports both the current legacy CSV format without header and a future header-based format.

Recommended future header:

```text
artnamn;scientificName;author;redlistCategory;observationCount25y
```

## Artportalen template mapping

Reference template:

```text
docs/ap2_template_treeproject.xlsx
```

The current XLSX export creates:

- `Observationer`
- `Parametrar`

The export uses the same main column structure as the Artportalen tree-project template, but must still be tested with the real Artportalen import workflow.

Known uncertainties:

- `Ost` and `Nord` currently receive WGS84 decimal longitude/latitude.
- `Lokalnamn` must refer to an existing Artportalen locality/fyndplats.
- observer/med-observer handling is not finalized.
- Excel validation rules from the original template are not fully reproduced.
- `Vetenskapligt namn` is kept in the form/local draft only and is **not exported** to the Artportalen XLSX template.

## Real tree data

The public ArcGIS item contains two point layers and both are queried:

- layer `0`: `SLU Skyddsvärda träd - Artportalen`
- layer `1`: `SLU Skyddsvärda träd - f.d. Trädportalen`

The app loads/refreshes tree records manually with the button:

```text
Ladda/uppdatera trädposter
```

It does not automatically reload after every map movement, to avoid repeated network requests on mobile devices.

## Lokalnamn

`Lokalnamn` should not be invented by the app.

Current candidate logic:

1. nearby `lokalnamn` from loaded tree records,
2. municipality name from local boundary intersect as the last fallback candidate.

The municipality fallback is not a preferred locality. It should only be used when no better nearby `Lokalnamn` is available.

## SCB municipality boundaries

Municipality fallback is configured to load:

```text
data/municipalities.scb.geojson
```

If that file is missing, the app falls back to:

```text
data/municipalities.sample.geojson
```

The SCB boundary file was prepared manually from SCB Digitala gränser, converted from Shapefile to GeoJSON, transformed to EPSG:4326 and simplified before being added to the app.

SCB boundaries are simplified and suitable here only as a fallback for municipality name, not for precise geospatial analysis.

## Running locally

Use a local web server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

For GPS testing on iPad/iPhone, GitHub Pages over HTTPS is usually easier.

## License

MIT.


## Required core fields

The app does not save a draft until all core fields in `Grunduppgifter` are filled in.

If a required field is missing, the field is highlighted in red and the browser focuses the first missing value.

Required core fields currently include:

- Artnamn
- Observationsdatum
- Lokalnamn i Artportalen
- Norr / latitud
- Öst / longitud
- Noggrannhet
- Stamomkrets
- Trädstatus
- Hålstadium
- Åtgärdsbehov
- Vitalitet levande träd (%)

Existing tree popups also show date information when a recognizable date field is present in the loaded source attributes.


## XLSX sharing

The app has two XLSX actions:

- `Exportera XLSX` downloads the file.
- `Dela XLSX` tries to share the generated XLSX through the device share sheet.

If file sharing is not supported by the browser, the app downloads the file and asks the user to attach it manually.

## GPS tracking

`Använd GPS` reads the current location once.

`GPS på` starts continuous GPS tracking and updates the selected observation point as the user moves. Use `Stoppa GPS` to stop tracking.

## SST validation

Before saving a draft, the app checks field-verifiable criteria for särskilt skyddsvärda träd.

The app currently accepts:

- `Jätteträd`: stem circumference above about 314 cm, corresponding to diameter above 100 cm.
- `Grovt hålträd`: stem circumference above about 126 cm, corresponding to diameter above 40 cm, and a visible/developed cavity.

The age criterion is intentionally not checked in the app.


## GPS tracking and locked tree point

The app separates two positions:

- the user's current GPS position,
- the reported tree point.

`GPS på` / `Stoppa GPS` can continue updating the user's current position.

When the user clicks the map, drags the tree marker, or uses `Använd GPS som trädpunkt`, the reported tree point is locked. After that, continued GPS updates do not overwrite `Norr`, `Öst` or `Noggrannhet` in the form.

After `Spara utkast`, the tree point is unlocked for the next record.


## Position section buttons

The Position section uses three main actions:

1. `GPS på` / `Stoppa GPS` – start or stop continuous GPS tracking.
2. `Använd GPS som trädpunkt` – use the current GPS position as the locked tree point.
3. `Ladda/uppdatera trädposter` – load existing tree records for the current map view.

This keeps GPS tracking, tree-point locking and context-data loading separate.


## Micro-snapping to existing tree records

When existing tree records are loaded, the app can micro-snap a newly selected tree point to an already reported tree if the selected point is within 5 metres.

This is only applied when the user explicitly sets or locks a tree point:

- clicking the map,
- dragging the tree marker,
- using `Använd GPS som trädpunkt`.

Continuous GPS tracking does not repeatedly snap the tree point while the user is moving.

When `Använd GPS som trädpunkt` is used, the GPS accuracy value is written to `Noggrannhet` in the form.
