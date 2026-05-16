# Artportalen import concept

The MVP should not publish directly to Artportalen.

Instead, the app should export structured data that can be reviewed and transformed into an import file compatible with the official Artportalen workflow for *skyddsvärda träd*.

## Current status

The current CSV export is only a technical placeholder.

It is not yet guaranteed to match:

- official column names,
- official controlled values,
- required fields,
- accepted coordinate format,
- photo handling rules,
- observer/project requirements.

## Next step

Download or verify the latest official import template for *Skyddsvärda träd*.

Then update:

- `src/config.js` export column order,
- `data/form-values.json`,
- `data/species.json`,
- `src/export-csv.js`,
- README documentation.

## Recommended design principle

Keep internal field names stable and add a dedicated export mapping layer later.

Example:

```text
internal app field → Artportalen import column
species            → official species column
latitude           → official latitude column
longitude          → official longitude column
```

This prevents the UI and storage model from breaking every time the import template changes.
