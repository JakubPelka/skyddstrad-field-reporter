import { APP_CONFIG } from "./config.js";
import { escapeHtml } from "./util.js";

let map;
let existingLayer;
let draftLayer;
let positionMarker;
let selectedMarker;
let resizeTimer;

export function initMap({ onMapClick }) {
  map = L.map("map", {
    zoomControl: true,
    preferCanvas: true
  }).setView(APP_CONFIG.defaultMapCenter, APP_CONFIG.defaultZoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
    detectRetina: true,
    updateWhenIdle: true,
    keepBuffer: 4,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  existingLayer = L.layerGroup().addTo(map);
  draftLayer = L.layerGroup().addTo(map);

  map.on("click", (event) => {
    setSelectedPoint(event.latlng.lat, event.latlng.lng);
    onMapClick?.({
      lat: event.latlng.lat,
      lng: event.latlng.lng
    });
  });

  setupMapResizeFixes();

  return map;
}

function setupMapResizeFixes() {
  refreshMapSize();

  window.addEventListener("load", refreshMapSize);
  window.addEventListener("resize", debouncedRefreshMapSize);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(refreshMapSize, 250);
    window.setTimeout(refreshMapSize, 700);
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshMapSize();
    }
  });
}

function debouncedRefreshMapSize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(refreshMapSize, 120);
}

export function refreshMapSize() {
  if (!map) {
    return;
  }

  requestAnimationFrame(() => {
    map.invalidateSize({ animate: false, pan: false });
  });
}

export function getMap() {
  return map;
}

export function getBounds() {
  return map.getBounds();
}

export function setExistingLayer(layer) {
  existingLayer.clearLayers();
  layer.eachLayer((item) => existingLayer.addLayer(item));
  refreshMapSize();
}

export function setSelectedPoint(lat, lng, label = "Selected observation point") {
  if (!selectedMarker) {
    selectedMarker = L.marker([lat, lng], {
      draggable: true,
      title: label
    }).addTo(map);

    selectedMarker.on("dragend", (event) => {
      const position = event.target.getLatLng();
      window.dispatchEvent(new CustomEvent("selected-point-moved", {
        detail: {
          lat: position.lat,
          lng: position.lng
        }
      }));
    });
  } else {
    selectedMarker.setLatLng([lat, lng]);
  }

  selectedMarker.bindPopup(escapeHtml(label));
}

export function showCurrentPosition(lat, lng, accuracyM = null) {
  const popup = accuracyM
    ? `Current GPS position<br>Accuracy: ${Math.round(accuracyM)} m`
    : "Current GPS position";

  if (!positionMarker) {
    positionMarker = L.circleMarker([lat, lng], {
      radius: 8,
      weight: 2,
      color: "#0c4a8a",
      fillColor: "#3b82c4",
      fillOpacity: 0.85
    }).addTo(map);
  } else {
    positionMarker.setLatLng([lat, lng]);
  }

  positionMarker.bindPopup(popup);
  setSelectedPoint(lat, lng);
  map.setView([lat, lng], Math.max(map.getZoom(), 17));
  refreshMapSize();
}

export function renderDraftMarkers(drafts) {
  draftLayer.clearLayers();

  for (const draft of drafts) {
    if (!Number.isFinite(draft.latitude) || !Number.isFinite(draft.longitude)) {
      continue;
    }

    const marker = L.circleMarker([draft.latitude, draft.longitude], {
      radius: 6,
      weight: 2,
      color: "#9b5f00",
      fillColor: "#f2b84b",
      fillOpacity: 0.85
    });

    marker.bindPopup(`
      <p class="popup-title">${escapeHtml(draft.species || "Draft tree")}</p>
      <ul class="popup-list">
        <li><strong>Date:</strong> ${escapeHtml(draft.observationDate || "")}</li>
        <li><strong>Circumference:</strong> ${escapeHtml(draft.stemCircumferenceCm ?? "")} cm</li>
        <li><strong>Diameter:</strong> ${escapeHtml(draft.stemDiameterCm ?? "")} cm</li>
        <li><strong>Status:</strong> ${escapeHtml(draft.treeStatus || "")}</li>
      </ul>
    `);

    draftLayer.addLayer(marker);
  }

  refreshMapSize();
}
