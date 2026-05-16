# Real data and Lokalnamn strategy

## Existing tree records

The app attempts to load existing tree records from the public ArcGIS item:

```text
Skyddsvärda Träd @ Sveriges Lantbruksuniversitet
ArcGIS item id: 3e9aa2c4fe1243d0afb181b8db1de1a4
```

The item contains two point layers:

```text
0 = SLU Skyddsvärda träd - Artportalen
1 = SLU Skyddsvärda träd - f.d. Trädportalen
```

Both layers are needed. SLU explains that all skyddsvärda träd are split between the old `Trädportalen` project and the newer `Skyddsvärda träd` project in Artportalen.

## Network behaviour

The app does not auto-refresh on every map movement.

Current behaviour:

```text
open app
→ initial load once
button: Ladda/uppdatera trädposter
→ manual reload for current map extent
```

This avoids repeated requests and button flickering on mobile devices.

## Lokalnamn candidates

Current MVP:

```text
selected GPS/map point
→ loaded tree records in current map extent
→ group by lokalnamn
→ sort by inside accuracy / nearest distance
→ show selectable candidates
```

## Important limitation

Many tree records may have no `lokalnamn`. Therefore candidate lists based only on tree records may be sparse.

## Next planned improvement

Use SLU Species Observation System API to search nearby public Artportalen observations from all species groups, then extract nearby locality/fyndplats names from those observations.

This should give a richer list of existing public localities near the selected GPS point.
