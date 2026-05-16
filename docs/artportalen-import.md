# Artportalen import mapping

The MVP does not publish directly to Artportalen.

Instead, the app exports XLSX drafts that should be reviewed before import.

## Template source

Reference template:

```text
docs/ap2_template_treeproject.xlsx
```

Analysed sheets:

```text
Observationer
Parametrar
```

The current app now uses the template structure more directly:

- the exported workbook contains an `Observationer` sheet,
- the exported workbook contains a `Parametrar` sheet,
- the `Observationer` sheet uses the same 50 row-2 headers as the Artportalen tree-project template,
- allowed values in the UI are copied from the template's `Parametrar` sheet.

## Important limitation

This is still a **field mapping prototype**.

Before real import, test the exported XLSX in Artportalen and verify:

- whether `Ost` and `Nord` accept WGS84 decimal longitude/latitude,
- whether `Lokalnamn` must already exist exactly in Artportalen,
- whether missing optional columns may stay blank,
- how observer/med-observer fields should be handled,
- whether row 1 and row 2 must remain exactly as in the template,
- whether workbook-level data validation rules are required by the import workflow.

## Current field mapping

See:

```text
docs/template-analysis.md
```

## Lokalnamn

`Lokalnamn` must not be invented by the app.

Current state:

- manual field in the form,
- prepared lookup UI,
- no verified Artportalen endpoint yet,
- no validation during export.

Next step should be to investigate whether Artportalen exposes a usable public endpoint for searching localities/fyndplatser.
