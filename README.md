# Fältrapportör för skyddsvärda träd

**Status:** Early proof of concept  
**Target platform:** Mobile-first web app / PWA  
**Map engine:** MapLibre GL JS  
**Primary use case:** Field recording of potential *särskilt skyddsvärda träd* and export of draft observations for later review/import into Artportalen.

## Purpose

This project is an experimental mobile field helper for recording potential **särskilt skyddsvärda träd**.

It is intended to help with:

- GPS-based field positioning,
- showing existing/sample tree points on a map,
- recording tree observations in a Swedish UI,
- warning about possible duplicates,
- saving local drafts in the browser,
- exporting drafts as XLSX and GeoJSON.

The project is not a replacement for Artportalen and does not publish observations directly.

## Important disclaimer

This is **not an official SLU, ArtDatabanken, Artportalen or Länsstyrelsen application**.

All exported data must be reviewed before import into Artportalen.

## Current implementation

The app currently uses:

- MapLibre GL JS for the map,
- OpenStreetMap raster tiles for the background map,
- local sample GeoJSON for existing tree records,
- localStorage for drafts,
- SheetJS/xlsx for XLSX export.

## Field workflow

The form is intentionally split into two parts:

1. **Grunduppgifter** – the most important fields shown immediately.
2. **Ytterligare attribut** – optional project parameters in a collapsible section.

This keeps the mobile UI usable in the field while still supporting Artportalen project parameters when needed.

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

## Lokalnamn

`Lokalnamn` should not be invented by the app.

The field is currently manual. A future step should investigate whether Artportalen exposes a usable locality/fyndplats lookup endpoint that can be queried from the app.

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
