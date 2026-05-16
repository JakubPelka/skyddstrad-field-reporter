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

## Current decision

The UI shows core fields first and moves optional project parameters to a collapsible section named `Ytterligare attribut`.

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
| vegetation fields | Vedartad vegetation columns |
| `surrounding1` | Omgivning 1 |
| `surrounding2` | Omgivning 2 |
| `surrounding3` | Omgivning 3 |
| `landUse` | Pågående markanvändning |

## Known uncertainties

- `Ost`/`Nord`: currently WGS84 decimal longitude/latitude. Must be tested in Artportalen.
- `Lokalnamn`: must refer to an Artportalen locality/fyndplats.
- `Med-observatör`: not mapped yet.
- Excel validation rules are not fully reproduced.
