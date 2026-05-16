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
