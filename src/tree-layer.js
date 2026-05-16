import { APP_CONFIG } from "./config.js";
import { escapeHtml } from "./util.js";

function buildUrlFromBounds(bounds) {
  if (!APP_CONFIG.existingTrees.urlTemplate) {
    return "";
  }

  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].map((value) => value.toFixed(6)).join(",");

  return APP_CONFIG.existingTrees.urlTemplate.replace("{bbox}", bbox);
}

function propertiesToPopup(properties) {
  const species = properties.species || properties.artnamn || properties.vernacularName || "Existing tree";
  const circumference = properties.stemCircumferenceCm || properties.stamomkrets || properties.omkrets || "";
  const status = properties.treeStatus || properties.tradstatus || "";
  const vitality = properties.vitality || properties.vitalitet || properties.vitalitet_levande_trad || "";
  const url = properties.url || properties.recordUrl || "";

  const rows = [
    ["Species", species],
    ["Circumference", circumference],
    ["Status", status],
    ["Vitality", vitality]
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  const list = rows
    .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`)
    .join("");

  const link = url
    ? `<p><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open source record</a></p>`
    : "";

  return `
    <p class="popup-title">${escapeHtml(species)}</p>
    <ul class="popup-list">${list}</ul>
    ${link}
  `;
}

function featureToTree(feature) {
  if (!feature?.geometry || feature.geometry.type !== "Point") {
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: feature.id || feature.properties?.id || feature.properties?.recordId || `${lat},${lng}`,
    lat,
    lng,
    properties: feature.properties || {}
  };
}

export async function loadExistingTrees(bounds = null) {
  let url = APP_CONFIG.existingTrees.sampleUrl;

  if (APP_CONFIG.existingTrees.mode === "url" && bounds) {
    url = buildUrlFromBounds(bounds);
  }

  if (!url) {
    return [];
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load existing tree records: ${response.status} ${response.statusText}`);
  }

  const geojson = await response.json();

  if (!Array.isArray(geojson.features)) {
    return [];
  }

  return geojson.features
    .map(featureToTree)
    .filter(Boolean);
}

export function createExistingTreesLayer(trees) {
  return L.layerGroup(
    trees.map((tree) => {
      const marker = L.circleMarker([tree.lat, tree.lng], {
        radius: 7,
        weight: 2,
        color: "#315f3d",
        fillColor: "#7ea66a",
        fillOpacity: 0.75
      });

      marker.bindPopup(propertiesToPopup(tree.properties));
      return marker;
    })
  );
}
