# Municipality fallback for Lokalnamn

If no better `Lokalnamn` candidate is found near the selected point, the app can suggest the municipality name, for example:

```text
Halmstads kommun
```

## Why

Many tree records do not contain `lokalnamn`. Nearby observations/localities are a better source, but without API keys or a backend this is not always available.

A municipality name is a practical fallback because the exact position is still stored in `Ost`, `Nord` and `Noggrannhet`.

## How it works

The user must click:

```text
Föreslå kommunnamn
```

The app then performs one manual reverse geocoding request for the selected point.

Current provider:

```text
Nominatim / OpenStreetMap
```

## Limitations

- This is not guaranteed to be a valid Artportalen locality.
- The user should prefer a real nearby `Lokalnamn` from existing observations when available.
- Nominatim must only be used for small, user-triggered requests and not bulk/systematic geocoding.
- A future production solution should use a proper locality source or a small backend/proxy.
