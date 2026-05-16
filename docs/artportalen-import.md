# Artportalen import and XLSX export

The MVP does not publish directly to Artportalen.

Instead, the app exports locally saved field drafts to XLSX and GeoJSON. The XLSX export is currently a simple structured export from the app's internal fields.

## Source of truth

The current Artportalen tree project import template is stored as:

```text
docs/ap2_template_treeproject.xlsx
```

This template should be treated as the source of truth for:

- required columns,
- column names,
- accepted value classes,
- controlled parameter values,
- import structure,
- future export mapping.

## Current status

Current XLSX export:

- writes one worksheet named `Fältdata`,
- uses Swedish field labels,
- includes internal draft ID and creation timestamp,
- includes `Lokalnamn`, coordinates, species, tree parameters and comment,
- is not yet guaranteed to match the official Artportalen import template exactly.

## Lokalnamn

`Lokalnamn` must not be invented automatically by the app.

In the current MVP, `Lokalnamn` is a manual text field. The user must enter the locality name expected by the later Artportalen import workflow.

Future work should investigate:

- lookup of existing Artportalen localities,
- project-specific allowed locality lists,
- validation of `Lokalnamn` before export,
- warning if the field is empty or unknown.

## Next implementation step

The next technical step is to read/analyze `docs/ap2_template_treeproject.xlsx` and create a mapping such as:

```text
internal app field → Artportalen template column
localName          → Lokalnamn / official template column
species            → Art / official template column
latitude           → coordinate column
longitude          → coordinate column
stemCircumference  → official tree-parameter column
```

After this mapping is confirmed, the XLSX export should be changed from a generic draft export to a template-compatible export.


## Mapping status after first Swedish XLSX patch

The current app export is still a working draft. It now uses Swedish field labels and stores the following coordinate labels:

```text
Norr (latitud, WGS84)
Öst (longitud, WGS84)
```

This is intentionally explicit: the app still stores WGS84 decimal latitude/longitude. Before real import use, verify whether the official Artportalen template expects WGS84 decimal values or another coordinate system with projected `Ost`/`Norr` values.

`Lokalnamn` is treated as a controlled Artportalen locality/fyndplats name. The app must not invent it from coordinates. A lookup UI has been prepared, but `APP_CONFIG.localitySearch.urlTemplate` is empty until a stable endpoint and response schema have been verified.
