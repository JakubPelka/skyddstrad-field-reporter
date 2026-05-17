import { APP_CONFIG } from "./config.js";
import { escapeHtml } from "./util.js";

let map;
let existingMarkers = [];
let draftMarkers = [];
let positionMarker;
let selectedMarker;
let resizeObserver;
let resizeTimer;

function createMarkerElement(className = "") {
  const element = document.createElement("div");
  element.className = `map-marker ${className}`.trim();
  return element;
}

function makePopup(html) {
  return new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: "280px"
  }).setHTML(html);
}

export function initMap({ onMapClick }) {
  map = new maplibregl.Map({
    container: "map",
    center: [APP_CONFIG.defaultMapCenter[1], APP_CONFIG.defaultMapCenter[0]],
    zoom: APP_CONFIG.defaultZoom,
    attributionControl: true,
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors"
        }
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm"
        }
      ]
    }
  });

  map.addControl(new maplibregl.NavigationControl({
    showCompass: false,
    visualizePitch: false
  }), "top-left");

  map.on("click", (event) => {
    const point = {
      lat: event.lngLat.lat,
      lng: event.lngLat.lng
    };

    setSelectedPoint(point.lat, point.lng);
    onMapClick?.(point);
  });

  setupResizeHandling();
  forceSeveralMapRefreshes();

  return map;
}

function setupResizeHandling() {
  const mapElement = document.querySelector("#map");

  if (window.ResizeObserver && mapElement) {
    resizeObserver = new ResizeObserver(() => debouncedRefreshMapSize());
    resizeObserver.observe(mapElement);
  }

  window.addEventListener("load", forceSeveralMapRefreshes);
  window.addEventListener("resize", debouncedRefreshMapSize);
  window.addEventListener("orientationchange", forceSeveralMapRefreshes);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      forceSeveralMapRefreshes();
    }
  });
}

function debouncedRefreshMapSize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(refreshMapSize, 80);
}

export function forceSeveralMapRefreshes() {
  [0, 80, 180, 400, 900].forEach((delay) => {
    window.setTimeout(refreshMapSize, delay);
  });
}

export function refreshMapSize() {
  if (!map) {
    return;
  }

  requestAnimationFrame(() => {
    map.resize();
  });
}

export function getMap() {
  return map;
}

export function getBounds() {
  const bounds = map.getBounds();

  return {
    getWest: () => bounds.getWest(),
    getSouth: () => bounds.getSouth(),
    getEast: () => bounds.getEast(),
    getNorth: () => bounds.getNorth()
  };
}

function clearMarkers(markers) {
  for (const marker of markers) {
    marker.remove();
  }
  markers.length = 0;
}

export function setExistingLayer(markerSpecs) {
  clearMarkers(existingMarkers);

  for (const spec of markerSpecs) {
    const marker = new maplibregl.Marker({
      element: createMarkerElement()
    })
      .setLngLat([spec.lng, spec.lat])
      .setPopup(makePopup(spec.popupHtml))
      .addTo(map);

    existingMarkers.push(marker);
  }

  forceSeveralMapRefreshes();
}

export function setSelectedPoint(lat, lng, label = "Vald observationspunkt") {
  if (!selectedMarker) {
    selectedMarker = new maplibregl.Marker({
      element: createMarkerElement("selected"),
      draggable: true
    })
      .setLngLat([lng, lat])
      .setPopup(makePopup(escapeHtml(label)))
      .addTo(map);

    selectedMarker.on("dragend", () => {
      const position = selectedMarker.getLngLat();
      window.dispatchEvent(new CustomEvent("selected-point-moved", {
        detail: {
          lat: position.lat,
          lng: position.lng
        }
      }));
    });
  } else {
    selectedMarker.setLngLat([lng, lat]);
  }

  selectedMarker.setPopup(makePopup(escapeHtml(label)));
}

export function showCurrentPosition(lat, lng, accuracyM = null) {
  const popup = accuracyM
    ? `Aktuell GPS-position<br>Noggrannhet: ${Math.round(accuracyM)} m`
    : "Aktuell GPS-position";

  if (!positionMarker) {
    positionMarker = new maplibregl.Marker({
      element: createMarkerElement("current")
    })
      .setLngLat([lng, lat])
      .setPopup(makePopup(popup))
      .addTo(map);
  } else {
    positionMarker.setLngLat([lng, lat]);
    positionMarker.setPopup(makePopup(popup));
  }

  map.easeTo({
    center: [lng, lat],
    zoom: Math.max(map.getZoom(), 17),
    duration: 300
  });
  forceSeveralMapRefreshes();
}

export function renderDraftMarkers(drafts) {
  clearMarkers(draftMarkers);

  for (const draft of drafts) {
    if (!Number.isFinite(draft.latitude) || !Number.isFinite(draft.longitude)) {
      continue;
    }

    const popupHtml = `
      <p class="popup-title">${escapeHtml(draft.species || "Trädutkast")}</p>
      <ul class="popup-list">
        <li><strong>Datum:</strong> ${escapeHtml(draft.observationDate || "")}</li>
        <li><strong>Lokalnamn:</strong> ${escapeHtml(draft.localName || "saknas")}</li>
        <li><strong>Omkrets:</strong> ${escapeHtml(draft.stemCircumferenceCm ?? "")} cm</li>
        <li><strong>Status:</strong> ${escapeHtml(draft.treeStatus || "")}</li>
      </ul>
    `;

    const marker = new maplibregl.Marker({
      element: createMarkerElement("draft")
    })
      .setLngLat([draft.longitude, draft.latitude])
      .setPopup(makePopup(popupHtml))
      .addTo(map);

    draftMarkers.push(marker);
  }

  forceSeveralMapRefreshes();
}
