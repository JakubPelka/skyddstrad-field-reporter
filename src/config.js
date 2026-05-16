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
  "hollowStage",
  "hollowPosition",
  "vitality",
  "managementNeed",
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
  hollowStage: "Hålstadium",
  hollowPosition: "Hålets placering",
  vitality: "Vitalitet",
  managementNeed: "Åtgärdsbehov",
  observer: "Observatör",
  comment: "Kommentar",
  createdAt: "Skapad i appen"
};
