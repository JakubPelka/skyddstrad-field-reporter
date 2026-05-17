# Taxon autocomplete

The app uses:

```text
data/TaxonList.csv
```

as a local taxon/autocomplete source.

## Purpose

The user must identify the species. The app only helps enter names in the same form as the local Artportalen-derived taxon list.

## UI fields

```text
Artnamn
Vetenskapligt namn
```

Typing in one field can fill the other field when an exact match exists.

Examples:

```text
Skogsek -> Quercus robur
Quercus robur -> Skogsek
```

## CSV format

The parser supports the current legacy format:

```text
Ekar;Quercus;L.;;189406
```

It also supports a future header-based format.

Recommended header:

```text
artnamn;scientificName;author;redlistCategory;observationCount25y
```

The last column is treated as a sorting/statistics value, not as a taxon ID.

## Export

The XLSX export writes only the Swedish `Artnamn` value to the `Artnamn` column.

`Vetenskapligt namn` remains a helper field in the form/local draft and is not exported to the Artportalen XLSX template.
