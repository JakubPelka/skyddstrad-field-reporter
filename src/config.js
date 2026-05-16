export const APP_VERSION = "20260516-stable-maplibre-template-ui-v2";

export const APP_CONFIG = {
  appName: "Fältrapportör för skyddsvärda träd",
  defaultMapCenter: [56.7182, 13.1292],
  defaultZoom: 15,
  duplicateDistanceM: 20,
  storageKey: "skyddstrad-field-reporter:drafts:v1",
  existingTrees: {
    mode: "sample",
    sampleUrl: "data/existing-trees.sample.geojson",
    urlTemplate: ""
  },
  localitySearch: {
    mode: "disabled",
    minQueryLength: 2,
    radiusM: 1000,
    urlTemplate: ""
  }
};

export const ARTPORTALEN_TEMPLATE = {
  sourceFile: "docs/ap2_template_treeproject.xlsx",
  observationSheetName: "Observationer",
  parameterSheetName: "Parametrar",
  projectName: "Projekt: Skyddsvärda träd",
  version: "Version 1.2"
};

export const ARTPORTALEN_OBSERVATION_HEADERS = [
  "Artnamn",
  "Antal",
  "Kön",
  "Lokalnamn",
  "Ost",
  "Nord",
  "Noggrannhet",
  "Startdatum",
  "Publik kommentar",
  "Intressant kommentar",
  "Privat kommentar",
  "Ej återfunnen",
  "Andrahand",
  "Osäker artbestämning",
  "Ospontan",
  "Art som substrat",
  "Art som substrat beskrivning",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Med-observatör",
  "Trädstatus",
  "Vitalitet levande träd (%)",
  "Stamomkrets (cm)",
  "Hålstadium",
  "Specificering av hål",
  "Mulmvolym",
  "Åtgärdsbehov",
  "Karaktärsdrag 1",
  "Karaktärsdrag 2",
  "Karaktärsdrag 3",
  "Grendiameter på hamlingsträd",
  "Vedartad vegetation buskar under kronan",
  "Vedartad veg. sly och ungträd under kronan",
  "Vedartad veg., lövträd och tall under kronan",
  "Vedartad veg., gran under kronan",
  "Vedartad vegetation buskar utanför kronan",
  "Vedartad veg., sly och ungträd utanför kronan",
  "Vedartad veg., lövträd och tall utanför kronan",
  "Vedartad veg., gran utanför kronan",
  "Omgivning 1",
  "Omgivning 2",
  "Omgivning 3",
  "Pågående markanvändning"
];

export const PARAMETER_SHEET_COLUMNS = [
  "Trädstatus",
  "Hålstadium",
  "Specificering av hål",
  "Mulmvolym",
  "Åtgärdsbehov",
  "Karaktärsdrag",
  "Vedväxter och täckningsgrad",
  "Omgivning",
  "Pågående markanvändning"
];
