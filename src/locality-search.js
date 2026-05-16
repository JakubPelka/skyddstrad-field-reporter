import { APP_CONFIG } from "./config.js";

function encodeTemplate(template, params) {
  return template
    .replaceAll("{query}", encodeURIComponent(params.query ?? ""))
    .replaceAll("{lat}", encodeURIComponent(params.lat ?? ""))
    .replaceAll("{lng}", encodeURIComponent(params.lng ?? ""))
    .replaceAll("{radiusM}", encodeURIComponent(params.radiusM ?? ""));
}

function normalizeLocality(item) {
  const name = item.localName || item.lokalnamn || item.name || item.fyndplatsnamn || item.title || "";
  const id = item.localityId || item.lokalId || item.id || item.siteId || item.fyndplatsId || "";
  const source = item.source || item.kalla || item.dataset || "Artportalen";
  const description = item.description || item.beskrivning || item.municipality || item.kommun || "";

  if (!name) {
    return null;
  }

  return {
    id: String(id),
    name: String(name),
    source: String(source),
    description: String(description)
  };
}

function extractItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.features)) {
    return payload.features.map((feature) => ({
      ...(feature.properties || {}),
      id: feature.id || feature.properties?.id
    }));
  }

  return [];
}

export async function searchLocalities({ query, point }) {
  const trimmedQuery = String(query || "").trim();
  const config = APP_CONFIG.localitySearch;

  if (trimmedQuery.length < config.minQueryLength) {
    return {
      status: "Skriv minst två tecken för att söka lokalnamn.",
      items: []
    };
  }

  if (config.mode !== "url" || !config.urlTemplate) {
    return {
      status: "Lokalnamnssökning är förberedd men ingen verifierad Artportalen-endpoint är konfigurerad ännu.",
      items: []
    };
  }

  const url = encodeTemplate(config.urlTemplate, {
    query: trimmedQuery,
    lat: point?.lat ?? "",
    lng: point?.lng ?? "",
    radiusM: config.radiusM
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kunde inte söka lokalnamn: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const items = extractItems(payload)
    .map(normalizeLocality)
    .filter(Boolean);

  return {
    status: items.length ? `${items.length} lokalnamn hittades.` : "Inga lokalnamn hittades.",
    items
  };
}
