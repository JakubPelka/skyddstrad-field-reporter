export const APP_VERSION = "20260516-template-mapping-v1";

export const APP_CONFIG = {
  appName: "Fältrapportör för skyddsvärda träd",

  // Test area: Simlångsdalen, Halmstad municipality.
  // Keep sample records close to this area during early mobile testing.
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
    // Prepared for later Artportalen/fyndplats lookup.
    // Keep disabled until a stable public endpoint and response schema have been verified.
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

export const FIELD_EXPORT_ORDER = [
  "id",
  "observationDate",
  "localName",
  "localityId",
  "species",
  "scientificName",
  "latitude",
  "longitude",
  "coordinateAccuracyM",
  "stemCircumferenceCm",
  "stemDiameterCm",
  "treeStatus",
  "vitalityPercent",
  "hollowStage",
  "holeSpecification",
  "mulmVolume",
  "managementNeed",
  "characteristic1",
  "characteristic2",
  "characteristic3",
  "pollardBranchDiameterCm",
  "woodyShrubsUnderCrown",
  "woodyYoungTreesUnderCrown",
  "woodyBroadleafPineUnderCrown",
  "woodySpruceUnderCrown",
  "woodyShrubsOutsideCrown",
  "woodyYoungTreesOutsideCrown",
  "woodyBroadleafPineOutsideCrown",
  "woodySpruceOutsideCrown",
  "surrounding1",
  "surrounding2",
  "surrounding3",
  "landUse",
  "observer",
  "comment",
  "createdAt"
];

export const FIELD_LABELS_SV = {
  id: "Internt ID",
  observationDate: "Observationsdatum",
  localName: "Lokalnamn",
  localityId: "Lokal-ID (om tillgängligt)",
  species: "Art",
  scientificName: "Vetenskapligt namn",
  latitude: "Norr (latitud, WGS84)",
  longitude: "Öst (longitud, WGS84)",
  coordinateAccuracyM: "Koordinatnoggrannhet (m)",
  stemCircumferenceCm: "Stamomkrets (cm)",
  stemDiameterCm: "Stamdiameter (cm)",
  treeStatus: "Trädstatus",
  vitalityPercent: "Vitalitet levande träd (%)",
  hollowStage: "Hålstadium",
  holeSpecification: "Specificering av hål",
  mulmVolume: "Mulmvolym",
  managementNeed: "Åtgärdsbehov",
  characteristic1: "Karaktärsdrag 1",
  characteristic2: "Karaktärsdrag 2",
  characteristic3: "Karaktärsdrag 3",
  pollardBranchDiameterCm: "Grendiameter på hamlingsträd",
  woodyShrubsUnderCrown: "Vedartad vegetation buskar under kronan",
  woodyYoungTreesUnderCrown: "Vedartad veg. sly och ungträd under kronan",
  woodyBroadleafPineUnderCrown: "Vedartad veg., lövträd och tall under kronan",
  woodySpruceUnderCrown: "Vedartad veg., gran under kronan",
  woodyShrubsOutsideCrown: "Vedartad vegetation buskar utanför kronan",
  woodyYoungTreesOutsideCrown: "Vedartad veg., sly och ungträd utanför kronan",
  woodyBroadleafPineOutsideCrown: "Vedartad veg., lövträd och tall utanför kronan",
  woodySpruceOutsideCrown: "Vedartad veg., gran utanför kronan",
  surrounding1: "Omgivning 1",
  surrounding2: "Omgivning 2",
  surrounding3: "Omgivning 3",
  landUse: "Pågående markanvändning",
  observer: "Observatör / fältanteckning",
  comment: "Kommentar",
  createdAt: "Skapad i appen"
};
