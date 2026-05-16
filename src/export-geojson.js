import { downloadBlob } from "./util.js";

export function draftsToGeoJson(drafts) {
  return {
    type: "FeatureCollection",
    name: "skyddstrad_field_reporter_drafts",
    features: drafts
      .filter((draft) => Number.isFinite(draft.latitude) && Number.isFinite(draft.longitude))
      .map((draft) => {
        const { latitude, longitude, ...properties } = draft;

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          properties
        };
      })
  };
}

export function exportDraftsAsGeoJson(drafts) {
  const geojson = draftsToGeoJson(drafts);
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/geo+json;charset=utf-8"
  });

  downloadBlob(`skyddstrad_drafts_${date}.geojson`, blob);
}
