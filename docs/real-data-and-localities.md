# Real data and Lokalnamn strategy

## Existing tree records

The app can attempt to load existing tree records from the public ArcGIS item:

```text
Skyddsvärda Träd @ Sveriges Lantbruksuniversitet
ArcGIS item id: 3e9aa2c4fe1243d0afb181b8db1de1a4
```

If the service is unavailable or CORS fails, the app falls back to local sample GeoJSON.

## Lokalnamn candidates

Current MVP:

```text
selected GPS/map point
→ loaded existing tree records in current map extent
→ group by lokalnamn
→ sort by inside accuracy / nearest distance
→ show selectable candidates
```

This is only a first step.

## Important limitation

Many tree records may have no `lokalnamn`. Therefore candidate lists based only on tree records may be sparse.

## Next planned improvement

Use SLU Species Observation System API to search nearby public Artportalen observations from all species groups, then extract nearby locality/fyndplats names from those observations.

This should give a richer list of existing public localities near the selected GPS point.

## Known open questions

- Exact public field name for locality/fyndplats in SOS response.
- Whether locality accuracy/radius is exposed in a stable way.
- CORS behavior from GitHub Pages.
- Query limits for small-radius mobile searches.
