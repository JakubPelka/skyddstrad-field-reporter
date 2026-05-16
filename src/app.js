import { APP_CONFIG } from "./config.js?v=20260516-stable-maplibre-template-ui-v2";
import { findNearbyTrees } from "./duplicate-check.js?v=20260516-stable-maplibre-template-ui-v2";
import { exportDraftsAsXlsx } from "./export-xlsx.js?v=20260516-stable-maplibre-template-ui-v2";
import { exportDraftsAsGeoJson } from "./export-geojson.js?v=20260516-stable-maplibre-template-ui-v2";
import { getDraftFromForm, initForm, resetTreeForm, setFormPosition } from "./form.js?v=20260516-stable-maplibre-template-ui-v2";
import { getCurrentPosition } from "./gps.js?v=20260516-stable-maplibre-template-ui-v2";
import { getBounds, initMap, renderDraftMarkers, setExistingLayer, showCurrentPosition } from "./map.js?v=20260516-stable-maplibre-template-ui-v2";
import { addDraft, clearDrafts, deleteDraft, loadDrafts } from "./storage.js?v=20260516-stable-maplibre-template-ui-v2";
import { createExistingTreesLayer, loadExistingTrees } from "./tree-layer.js?v=20260516-stable-maplibre-template-ui-v2";
import { formatDistance } from "./util.js?v=20260516-stable-maplibre-template-ui-v2";

let existingTrees = [];
let selectedPoint = null;

const elements = {
  form: document.querySelector("#tree-form"),
  gpsStatus: document.querySelector("#gps-status"),
  duplicateWarning: document.querySelector("#duplicate-warning"),
  draftCount: document.querySelector("#draft-count"),
  draftList: document.querySelector("#draft-list"),
  draftTemplate: document.querySelector("#draft-item-template"),
  useGpsButton: document.querySelector("#btn-use-gps"),
  loadExistingButton: document.querySelector("#btn-load-existing"),
  resetFormButton: document.querySelector("#btn-reset-form"),
  exportXlsxButton: document.querySelector("#btn-export-xlsx"),
  exportGeoJsonButton: document.querySelector("#btn-export-geojson"),
  clearDraftsButton: document.querySelector("#btn-clear-drafts")
};

function setStatus(message) {
  elements.gpsStatus.textContent = message;
}

function updateDuplicateWarning() {
  if (!selectedPoint) {
    elements.duplicateWarning.hidden = true;
    elements.duplicateWarning.textContent = "";
    return;
  }

  const nearby = findNearbyTrees(selectedPoint, existingTrees, APP_CONFIG.duplicateDistanceM);

  if (nearby.length === 0) {
    elements.duplicateWarning.hidden = true;
    elements.duplicateWarning.textContent = "";
    return;
  }

  const closest = nearby[0];
  const species = closest.properties.species || closest.properties.artnamn || closest.properties.vernacularName || "befintligt träd";

  elements.duplicateWarning.hidden = false;
  elements.duplicateWarning.textContent = `Möjlig dubblett: ${nearby.length} befintlig(a) post(er) inom ${APP_CONFIG.duplicateDistanceM} m. Närmast: ${species}, ${formatDistance(closest.distanceM)} bort.`;
}

async function loadAndRenderExistingTrees() {
  elements.loadExistingButton.disabled = true;
  elements.loadExistingButton.textContent = "Laddar...";

  try {
    existingTrees = await loadExistingTrees(getBounds());
    const layer = createExistingTreesLayer(existingTrees);
    setExistingLayer(layer);
    updateDuplicateWarning();
    setStatus(`Laddade ${existingTrees.length} befintliga trädposter. Läge: ${APP_CONFIG.existingTrees.mode}.`);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  } finally {
    elements.loadExistingButton.disabled = false;
    elements.loadExistingButton.textContent = "Ladda testträd";
  }
}

function renderDrafts() {
  const drafts = loadDrafts();

  elements.draftCount.textContent = drafts.length === 1
    ? "1 utkast sparat."
    : `${drafts.length} utkast sparade.`;

  elements.draftList.innerHTML = "";

  for (const draft of drafts) {
    const item = elements.draftTemplate.content.cloneNode(true);
    const title = item.querySelector(".draft-title");
    const meta = item.querySelector(".draft-meta");
    const deleteButton = item.querySelector(".draft-delete");

    title.textContent = draft.species || "Träd utan art";
    meta.textContent = [
      draft.observationDate,
      draft.localName ? `Lokal: ${draft.localName}` : "Lokalnamn saknas",
      Number.isFinite(draft.stemCircumferenceCm) ? `${draft.stemCircumferenceCm} cm omkrets` : "",
      draft.treeStatus ? `Status: ${draft.treeStatus}` : "",
      `Norr ${draft.latitude?.toFixed?.(6) ?? ""}, Öst ${draft.longitude?.toFixed?.(6) ?? ""}`
    ].filter(Boolean).join(" · ");

    deleteButton.addEventListener("click", () => {
      deleteDraft(draft.id);
      renderDrafts();
    });

    elements.draftList.appendChild(item);
  }

  renderDraftMarkers(drafts);
}

function bindEvents() {
  elements.useGpsButton.addEventListener("click", async () => {
    setStatus("Läser GPS-position...");

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;

      selectedPoint = {
        lat: latitude,
        lng: longitude
      };

      showCurrentPosition(latitude, longitude, accuracy);
      setFormPosition({
        lat: latitude,
        lng: longitude,
        accuracyM: accuracy
      });

      updateDuplicateWarning();
      setStatus(`GPS-position satt. Noggrannhet: ${Math.round(accuracy)} m.`);
    } catch (error) {
      console.error(error);
      setStatus(`GPS-fel: ${error.message}`);
    }
  });

  elements.loadExistingButton.addEventListener("click", loadAndRenderExistingTrees);

  elements.resetFormButton.addEventListener("click", () => {
    resetTreeForm(elements.form);
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      const draft = getDraftFromForm(elements.form);
      addDraft(draft);
      selectedPoint = {
        lat: draft.latitude,
        lng: draft.longitude
      };
      resetTreeForm(elements.form);
      renderDrafts();
      updateDuplicateWarning();
    } catch (error) {
      alert(error.message);
    }
  });

  elements.exportXlsxButton.addEventListener("click", () => {
    const drafts = loadDrafts();

    if (drafts.length === 0) {
      alert("Det finns inga utkast att exportera.");
      return;
    }

    try {
      exportDraftsAsXlsx(drafts);
    } catch (error) {
      alert(error.message);
    }
  });

  elements.exportGeoJsonButton.addEventListener("click", () => {
    const drafts = loadDrafts();

    if (drafts.length === 0) {
      alert("Det finns inga utkast att exportera.");
      return;
    }

    exportDraftsAsGeoJson(drafts);
  });

  elements.clearDraftsButton.addEventListener("click", () => {
    const confirmed = confirm("Vill du radera alla lokalt sparade utkast i den här webbläsaren?");

    if (confirmed) {
      clearDrafts();
      renderDrafts();
    }
  });

  window.addEventListener("selected-point-moved", (event) => {
    selectedPoint = event.detail;
    setFormPosition(event.detail);
    updateDuplicateWarning();
  });
}

async function main() {
  await initForm();

  initMap({
    onMapClick: (point) => {
      selectedPoint = point;
      setFormPosition(point);
      updateDuplicateWarning();
    }
  });

  bindEvents();
  renderDrafts();
  await loadAndRenderExistingTrees();
}

main().catch((error) => {
  console.error(error);
  setStatus(`Startfel: ${error.message}`);
});
