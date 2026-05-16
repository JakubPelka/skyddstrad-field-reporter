import { APP_CONFIG } from "./config.js";
import { escapeHtml } from "./util.js";

let resolvedArcgisServiceUrl = "";

function arcgisItemUrl(itemId) {
  return `https://www.arcgis.com/sharing/rest/content/items/${encodeURIComponent(itemId)}?f=json`;
}

function normalizeArcgisServiceUrl(itemUrl) {
  if (!itemUrl) {
    return "";
  }

  const url = itemUrl.replace(/\/+$/, "");

  if (/\/(FeatureServer|MapServer)\/\d+$/i.test(url)) {
    return url.replace(/\/\d+$/i, "");
  }

  return url;
}

async function resolveArcgisServiceUrl() {
  if (resolvedArcgisServiceUrl) {
    return resolvedArcgisServiceUrl;
  }

  const response = await fetch(arcgisItemUrl(APP_CONFIG.existingTrees.arcgisItemId));

  if (!response.ok) {
    throw new Error(`Kunde inte läsa ArcGIS item: ${response.status} ${response.statusText}`);
  }

  const item = await response.json();
  const serviceUrl = normalizeArcgisServiceUrl(item.url);

  if (!serviceUrl) {
    throw new Error("ArcGIS item saknar publik tjänste-URL.");
  }

  resolvedArcgisServiceUrl = serviceUrl;
  return resolvedArcgisServiceUrl;
}

function boundsToArcgisGeometry(bounds) {
  return JSON.stringify({
    xmin: bounds.getWest(),
    ymin: bounds.getSouth(),
    xmax: bounds.getEast(),
    ymax: bounds.getNorth(),
    spatialReference: { wkid: 4326 }
  });
}

function arcgisQueryUrl(serviceUrl, layerId, bounds) {
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    outFields: "*",
    returnGeometry: "true",
    geometry: boundsToArcgisGeometry(bounds),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    resultRecordCount: String(APP_CONFIG.existingTrees.maxRecordsPerLayer || 1500)
  });

  return `${serviceUrl}/${layerId}/query?${params.toString()}`;
}

function geoJsonFeatureToTree(feature) {
  if (!feature?.geometry || feature.geometry.type !== "Point") {
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: feature.id || feature.properties?.id_artportalen || feature.properties?.OBJECTID || `${lat},${lng}`,
    lat,
    lng,
    layerId: "sample",
    properties: feature.properties || {}
  };
}

function arcgisFeatureToTree(feature, layerId) {
  const geometry = feature.geometry || {};
  const attributes = feature.attributes || {};
  const lng = geometry.x;
  const lat = geometry.y;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: `${layerId}:${attributes.id_artportalen || attributes.OBJECTID || attributes.objectid || `${lat},${lng}`}`,
    lat,
    lng,
    layerId,
    properties: {
      ...attributes,
      _sourceLayerId: layerId,
      _sourceProject: layerId === 1 ? "f.d. Trädportalen" : "Artportalen"
    }
  };
}

async function loadSampleTrees() {
  const response = await fetch(APP_CONFIG.existingTrees.sampleUrl);

  if (!response.ok) {
    throw new Error(`Kunde inte ladda testdata: ${response.status} ${response.statusText}`);
  }

  const geojson = await response.json();
  return (geojson.features || []).map(geoJsonFeatureToTree).filter(Boolean);
}

async function loadArcgisLayer(serviceUrl, layerId, bounds) {
  const response = await fetch(arcgisQueryUrl(serviceUrl, layerId, bounds));

  if (!response.ok) {
    throw new Error(`Kunde inte hämta träddata från lager ${layerId}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || `ArcGIS query misslyckades för lager ${layerId}.`);
  }

  return (data.features || []).map((feature) => arcgisFeatureToTree(feature, layerId)).filter(Boolean);
}

async function loadArcgisTrees(bounds) {
  const serviceUrl = await resolveArcgisServiceUrl();
  const layerIds = APP_CONFIG.existingTrees.layerIds || [0];

  const layerResults = await Promise.allSettled(
    layerIds.map((layerId) => loadArcgisLayer(serviceUrl, layerId, bounds))
  );

  const trees = [];
  const errors = [];

  for (const result of layerResults) {
    if (result.status === "fulfilled") {
      trees.push(...result.value);
    } else {
      errors.push(result.reason);
      console.warn(result.reason);
    }
  }

  if (trees.length === 0 && errors.length > 0) {
    throw errors[0];
  }

  return trees;
}

function propertiesToPopup(properties) {
  const species = properties.artnamn || properties.species || properties.vernacularName || "Befintligt träd";
  const localName = properties.lokalnamn || "";
  const circumference = properties.stamomkrets || properties.stemCircumferenceCm || properties.omkrets || "";
  const status = properties.tradstatus || properties.treeStatus || "";
  const hollow = properties.halstadium || "";
  const management = properties.atgardsbehov || "";
  const id = properties.id_artportalen || properties.OBJECTID || "";
  const accuracy = properties.noggrannhet || "";
  const project = properties._sourceProject || "";

  const rows = [
    ["Art", species],
    ["Projekt/lager", project],
    ["Lokalnamn", localName],
    ["Omkrets", circumference ? `${circumference} cm` : ""],
    ["Status", status],
    ["Hålstadium", hollow],
    ["Åtgärdsbehov", management],
    ["Noggrannhet", accuracy ? `${accuracy} m` : ""],
    ["ID", id]
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  const list = rows
    .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`)
    .join("");

  return `
    <p class="popup-title">${escapeHtml(species)}</p>
    <ul class="popup-list">${list}</ul>
  `;
}

export async function loadExistingTrees(bounds = null) {
  if (APP_CONFIG.existingTrees.mode === "sample") {
    return loadSampleTrees();
  }

  try {
    return await loadArcgisTrees(bounds);
  } catch (error) {
    console.warn("Falling back to sample trees.", error);

    if (APP_CONFIG.existingTrees.fallbackToSample) {
      return loadSampleTrees();
    }

    throw error;
  }
}

export function createExistingTreesLayer(trees) {
  return trees.map((tree) => ({
    id: tree.id,
    lat: tree.lat,
    lng: tree.lng,
    layerId: tree.layerId,
    popupHtml: propertiesToPopup(tree.properties)
  }));
}
