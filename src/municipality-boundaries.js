import { APP_CONFIG } from "./config.js";

let municipalityFeatures = null;

function fieldValue(properties, fields) {
  for (const field of fields) {
    if (properties?.[field] !== undefined && properties?.[field] !== null && properties?.[field] !== "") {
      return properties[field];
    }
  }

  return "";
}

function normalizeMunicipalityName(value) {
  const name = String(value || "").trim();

  if (!name) {
    return "";
  }

  if (/kommun$/i.test(name)) {
    return name;
  }

  return `${name} kommun`;
}

function pointInRing(point, ring) {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygon(point, polygonCoordinates) {
  if (!polygonCoordinates?.length) {
    return false;
  }

  const outer = polygonCoordinates[0];
  const holes = polygonCoordinates.slice(1);

  if (!pointInRing(point, outer)) {
    return false;
  }

  return !holes.some((hole) => pointInRing(point, hole));
}

function pointInGeometry(point, geometry) {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }

  return false;
}

async function fetchBoundaryGeoJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Kunde inte ladda kommungränser från ${url} (${response.status}).`);
  }

  return response.json();
}

async function loadMunicipalityFeatures() {
  if (municipalityFeatures) {
    return municipalityFeatures;
  }

  if (!APP_CONFIG.municipalityBoundaries?.enabled) {
    municipalityFeatures = [];
    return municipalityFeatures;
  }

  const urls = [
    APP_CONFIG.municipalityBoundaries.url,
    APP_CONFIG.municipalityBoundaries.fallbackUrl
  ].filter(Boolean);

  let lastError = null;

  for (const url of urls) {
    try {
      const geojson = await fetchBoundaryGeoJson(url);
      municipalityFeatures = Array.isArray(geojson.features) ? geojson.features : [];
      return municipalityFeatures;
    } catch (error) {
      lastError = error;
      console.warn(error);
    }
  }

  throw lastError || new Error("Kunde inte ladda kommungränser.");
}

export async function findMunicipalityCandidate(point) {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
    return null;
  }

  const features = await loadMunicipalityFeatures();

  for (const feature of features) {
    if (!pointInGeometry(point, feature.geometry)) {
      continue;
    }

    const localName = normalizeMunicipalityName(
      fieldValue(feature.properties, APP_CONFIG.municipalityBoundaries.nameFields)
    );

    if (!localName) {
      continue;
    }

    return {
      localName,
      localityId: String(fieldValue(feature.properties, APP_CONFIG.municipalityBoundaries.codeFields) || ""),
      source: "kommungräns",
      isMunicipalityFallback: true,
      distanceM: Number.POSITIVE_INFINITY
    };
  }

  return null;
}
