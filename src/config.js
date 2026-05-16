export const APP_CONFIG = {
  appName: "Skyddsträd Field Reporter",

  // Test area: Simlångsdalen, Halmstad municipality.
  // Keep sample records close to this area during early mobile testing.
  defaultMapCenter: [56.7182, 13.1292],
  defaultZoom: 15,

  duplicateDistanceM: 20,
  storageKey: "skyddstrad-field-reporter:drafts:v1",
  existingTrees: {
    mode: "sample",
    sampleUrl: "data/existing-trees.sample.geojson",

    // Future real-data mode.
    // Set mode to "url" and configure urlTemplate after verifying endpoint, CORS and attributes.
    //
    // Example pattern:
    // urlTemplate: "https://example.com/wfs?service=WFS&request=GetFeature&typeName=...&outputFormat=application/json&bbox={bbox}"
    //
    // {bbox} is replaced with west,south,east,north in EPSG:4326.
    urlTemplate: ""
  }
};

export const FIELD_EXPORT_ORDER = [
  "id",
  "observationDate",
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
