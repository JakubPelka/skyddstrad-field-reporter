# Data sources

The current scaffold uses only local sample data:

```text
data/existing-trees.sample.geojson
```

The real data source for existing *särskilt skyddsvärda träd* must be verified before implementation.

## Candidate sources to verify

- SLU / ArtDatabanken open data and APIs
- SLU Species Observation System API / WFS
- Länsstyrelsernas Geodatakatalogen layer for **SLU Skyddsvärda träd - Artportalen**
- Artportalen reporting help and import templates

## Information that must be confirmed

For the selected source, confirm:

- endpoint URL,
- request type,
- supported filters,
- coordinate reference system,
- output format,
- CORS behaviour,
- license,
- update frequency,
- attribute names,
- whether both `Trädportalen` and `Skyddsvärda träd` are included,
- whether sensitive or protected records are excluded/generalized,
- how links to original records are represented.

## Implementation note

After verification, configure the source in:

```text
src/config.js
```

Change:

```js
existingTrees: {
  mode: "sample"
}
```

to a real endpoint mode when ready.
