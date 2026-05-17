import { APP_CONFIG } from "./config.js";

function normalizeMunicipalityName(value) {
  if (!value) {
    return "";
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  if (/kommun$/i.test(text)) {
    return text;
  }

  return `${text} kommun`;
}

function pickMunicipality(address = {}) {
  // In Sweden, Nominatim normally returns the municipality in address.municipality.
  // Do not fall back to village/town here, because those are not necessarily Artportalen localities.
  return normalizeMunicipalityName(address.municipality || "");
}

export async function fetchMunicipalityFallback(point) {
  if (!APP_CONFIG.municipalityFallback?.enabled) {
    throw new Error("Kommunförslag är avstängt i konfigurationen.");
  }

  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
    throw new Error("Välj en punkt i kartan eller använd GPS först.");
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lng),
    zoom: String(APP_CONFIG.municipalityFallback.zoom || 10),
    addressdetails: String(APP_CONFIG.municipalityFallback.addressDetails ?? 1),
    "accept-language": APP_CONFIG.municipalityFallback.language || "sv"
  });

  const url = `${APP_CONFIG.municipalityFallback.reverseUrl}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Kunde inte hämta kommunnamn (${response.status}).`);
  }

  const data = await response.json();
  const municipality = pickMunicipality(data.address || {});

  if (!municipality) {
    throw new Error("Kunde inte hitta kommunnamn för vald position.");
  }

  return {
    localName: municipality,
    source: "Nominatim / OpenStreetMap",
    displayName: data.display_name || "",
    rawAddress: data.address || {}
  };
}
