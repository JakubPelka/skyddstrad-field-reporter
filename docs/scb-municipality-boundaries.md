# SCB municipality boundaries

For the current MVP, municipality fallback can use SCB's simplified digital boundaries.

SCB source page:

```text
Digitala gränser
```

Download used by the helper script:

```text
https://www.scb.se/contentassets/3443fea3fa6640f7a57ea15d9a372d33/shape_svenska_260225.zip
```

SCB describes these files as coordinate files in SWEREF99 TM for counties, municipalities and regions in ArcView Shape and MapInfo TAB formats. SCB open data is published under CC0.

Important limitation from SCB: the boundaries are simplified and adapted for thematic statistics. They are not intended for precise analysis. For exact boundaries, use Lantmäteriet.

## Generate browser GeoJSON

Install dependencies:

```bash
python -m pip install geopandas pyogrio shapely pyproj requests
```

Generate:

```bash
python scripts/build_scb_municipalities.py
```

Output:

```text
data/municipalities.scb.geojson
```

The app tries to load:

```text
data/municipalities.scb.geojson
```

If it does not exist, it falls back to:

```text
data/municipalities.sample.geojson
```

## Why not commit SCB ZIP?

The SCB ZIP is a source download, not app source code. Keep it out of the repo.

Recommended local path:

```text
downloads/shape_svenska_260225.zip
```

This should remain ignored by Git.
