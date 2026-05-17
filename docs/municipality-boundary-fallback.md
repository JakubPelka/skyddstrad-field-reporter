# Municipality boundary fallback for Lokalnamn

This version does not use external reverse geocoding.

Instead it intersects the selected point with a local GeoJSON file:

```text
data/municipalities.sample.geojson
```

The municipality name is added as the last `Lokalnamn` candidate.

## Current data

The included file is only a small sample polygon for testing around Halmstad/Simlångsdalen.

Before broader use, replace it with simplified open data from SCB or Lantmäteriet.

Expected properties:

```text
kommunnamn
kommunkod
```

Other field names can be configured in:

```text
src/config.js
APP_CONFIG.municipalityBoundaries.nameFields
APP_CONFIG.municipalityBoundaries.codeFields
```

## UI logic

The `Uppdatera lokalnamnsförslag` button now creates one combined list:

1. Nearby `lokalnamn` from loaded tree records.
2. Municipality name from local boundary intersect as the last fallback candidate.

## Limitations

- Municipality name is a fallback, not a preferred locality.
- Use nearby real Artportalen locality names when available.
- The sample polygon is not authoritative.
