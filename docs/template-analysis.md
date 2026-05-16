# Artportalen tree import template analysis

Source file:

```text
docs/ap2_template_treeproject.xlsx
```

Analysed sheets:

```text
Observationer
Parametrar
```

## Observationer sheet

The template uses two header rows.

Row 1 contains project/template metadata:

- `Projekt: Skyddsvärda träd`
- `Version 1.2`
- `Projektparametrar`

Row 2 contains the import columns. The current app now exports an `Observationer` sheet with the same 50 column headers.

## Observationer columns

```text
Artnamn
Antal
Kön
Lokalnamn
Ost
Nord
Noggrannhet
Startdatum
Publik kommentar
Intressant kommentar
Privat kommentar
Ej återfunnen
Andrahand
Osäker artbestämning
Ospontan
Art som substrat
Art som substrat beskrivning
Med-observatör x10
Trädstatus
Vitalitet levande träd (%)
Stamomkrets (cm)
Hålstadium
Specificering av hål
Mulmvolym
Åtgärdsbehov
Karaktärsdrag 1
Karaktärsdrag 2
Karaktärsdrag 3
Grendiameter på hamlingsträd
Vedartad vegetation buskar under kronan
Vedartad veg. sly och ungträd under kronan
Vedartad veg., lövträd och tall under kronan
Vedartad veg., gran under kronan
Vedartad vegetation buskar utanför kronan
Vedartad veg., sly och ungträd utanför kronan
Vedartad veg., lövträd och tall utanför kronan
Vedartad veg., gran utanför kronan
Omgivning 1
Omgivning 2
Omgivning 3
Pågående markanvändning
```

## Parametrar sheet

The app now copies allowed values from the `Parametrar` sheet into:

```text
data/form-values.json
```

Parameter columns used:

| Template parameter | App field(s) |
|---|---|
| Trädstatus | `treeStatus` |
| Hålstadium | `hollowStage` |
| Specificering av hål | `holeSpecification` |
| Mulmvolym | `mulmVolume` |
| Åtgärdsbehov | `managementNeed` |
| Karaktärsdrag | `characteristic1`, `characteristic2`, `characteristic3` |
| Vedväxter och täckningsgrad | all vegetation coverage fields |
| Omgivning | `surrounding1`, `surrounding2`, `surrounding3` |
| Pågående markanvändning | `landUse` |

## Current export mapping

| App field | Export column |
|---|---|
| `species` | Artnamn |
| constant `1` | Antal |
| `localName` | Lokalnamn |
| `longitude` | Ost |
| `latitude` | Nord |
| `coordinateAccuracyM` | Noggrannhet |
| `observationDate` | Startdatum |
| `comment` | Publik kommentar |
| `treeStatus` | Trädstatus |
| `vitalityPercent` | Vitalitet levande träd (%) |
| `stemCircumferenceCm` | Stamomkrets (cm) |
| `hollowStage` | Hålstadium |
| `holeSpecification` | Specificering av hål |
| `mulmVolume` | Mulmvolym |
| `managementNeed` | Åtgärdsbehov |
| `characteristic1` | Karaktärsdrag 1 |
| `characteristic2` | Karaktärsdrag 2 |
| `characteristic3` | Karaktärsdrag 3 |
| `pollardBranchDiameterCm` | Grendiameter på hamlingsträd |
| `woodyShrubsUnderCrown` | Vedartad vegetation buskar under kronan |
| `woodyYoungTreesUnderCrown` | Vedartad veg. sly och ungträd under kronan |
| `woodyBroadleafPineUnderCrown` | Vedartad veg., lövträd och tall under kronan |
| `woodySpruceUnderCrown` | Vedartad veg., gran under kronan |
| `woodyShrubsOutsideCrown` | Vedartad vegetation buskar utanför kronan |
| `woodyYoungTreesOutsideCrown` | Vedartad veg., sly och ungträd utanför kronan |
| `woodyBroadleafPineOutsideCrown` | Vedartad veg., lövträd och tall utanför kronan |
| `woodySpruceOutsideCrown` | Vedartad veg., gran utanför kronan |
| `surrounding1` | Omgivning 1 |
| `surrounding2` | Omgivning 2 |
| `surrounding3` | Omgivning 3 |
| `landUse` | Pågående markanvändning |

## Known uncertainties

- `Ost`/`Nord`: the app currently exports WGS84 decimal longitude/latitude into these columns. This must be verified against Artportalen import expectations before real use.
- `Lokalnamn`: must refer to an Artportalen locality/fyndplats. The app does not yet validate it.
- `Observatör`: the current field is saved in the local draft but is not mapped to `Med-observatör`, because uploader/observer handling must be clarified.
- Photos are still outside the XLSX export.
- The exported workbook does not yet reproduce all Excel validation rules from the original template.
