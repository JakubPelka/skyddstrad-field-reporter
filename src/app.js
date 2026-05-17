import { APP_CONFIG } from "./config.js?v=20260517-taxon-autocomplete-v1";
import { findNearbyTrees } from "./duplicate-check.js?v=20260517-taxon-autocomplete-v1";
import { exportDraftsAsXlsx } from "./export-xlsx.js?v=20260517-taxon-autocomplete-v1";
import { exportDraftsAsGeoJson } from "./export-geojson.js?v=20260517-taxon-autocomplete-v1";
import { getDraftFromForm, initForm, resetTreeForm, setFormPosition, setLocalName } from "./form.js?v=20260517-taxon-autocomplete-v1";
import { getCurrentPosition } from "./gps.js?v=20260517-taxon-autocomplete-v1";
import { getBounds, initMap, renderDraftMarkers, setExistingLayer, showCurrentPosition } from "./map.js?v=20260517-taxon-autocomplete-v1";
import { addDraft, clearDrafts, deleteDraft, loadDrafts } from "./storage.js?v=20260517-taxon-autocomplete-v1";
import { createExistingTreesLayer, loadExistingTrees } from "./tree-layer.js?v=20260517-taxon-autocomplete-v1";
import { candidateStatusText, findLocalityCandidates } from "./locality-candidates.js?v=20260517-taxon-autocomplete-v1";
import { findMunicipalityCandidate } from "./municipality-boundaries.js?v=20260517-taxon-autocomplete-v1";
import { escapeHtml, formatDistance } from "./util.js?v=20260517-taxon-autocomplete-v1";

let existingTrees = [];
let selectedPoint = null;
let loadingExistingTrees = false;

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
  clearDraftsButton: document.querySelector("#btn-clear-drafts"),
  localityStatus: document.querySelector("#locality-status"),
  localityResults: document.querySelector("#locality-results"),
  refreshLocalitiesButton: document.querySelector("#btn-refresh-localities")
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
  const species = closest.properties.artnamn || closest.properties.species || closest.properties.vernacularName || "befintligt träd";

  elements.duplicateWarning.hidden = false;
  elements.duplicateWarning.textContent = `Möjlig dubblett: ${nearby.length} befintlig(a) post(er) inom ${APP_CONFIG.duplicateDistanceM} m. Närmast: ${species}, ${formatDistance(closest.distanceM)} bort.`;
}

async function renderLocalityCandidates() {
  if (!elements.localityResults || !elements.localityStatus) {
    return;
  }

  elements.localityResults.innerHTML = "";

  if (!selectedPoint) {
    elements.localityStatus.textContent = "Välj punkt i kartan eller använd GPS för att föreslå lokalnamn.";
    return;
  }

  const treeCandidates = existingTrees.length > 0
    ? findLocalityCandidates(selectedPoint, existingTrees)
    : [];

  let municipalityCandidate = null;

  if (APP_CONFIG.localityCandidates.includeMunicipalityFallback) {
    try {
      municipalityCandidate = await findMunicipalityCandidate(selectedPoint);
    } catch (error) {
      console.warn(error);
    }
  }

  const candidates = [...treeCandidates];

  if (municipalityCandidate) {
    candidates.push(municipalityCandidate);
  }

  if (candidates.length === 0) {
    elements.localityStatus.textContent = "Inga lokalnamn hittades och ingen kommungräns matchade vald position.";
    return;
  }

  const treeText = treeCandidates.length === 1
    ? "1 lokalnamn från trädposter"
    : `${treeCandidates.length} lokalnamn från trädposter`;

  const municipalityText = municipalityCandidate
    ? " + kommunnamn som sista fallback"
    : "";

  elements.localityStatus.textContent = `${treeText}${municipalityText}.`;

  for (const candidate of candidates) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = candidate.isMunicipalityFallback
      ? "locality-result municipality-result"
      : "locality-result";

    const statusText = candidate.isMunicipalityFallback
      ? `${APP_CONFIG.localityCandidates.municipalityFallbackLabel} · kontrollera vid import`
      : candidateStatusText(candidate);

    const detailText = candidate.isMunicipalityFallback
      ? "Använd bara om inget bättre lokalnamn finns i närheten."
      : `${candidate.treeCount} trädpost(er)${candidate.species ? ` · ${escapeHtml(candidate.species)}` : ""}`;

    button.innerHTML = `
      <strong>${escapeHtml(candidate.localName)}</strong>
      <span>${escapeHtml(statusText)}</span>
      <small>${detailText}</small>
    `;
    button.addEventListener("click", () => {
      setLocalName(candidate.localName, candidate.localityId || "");
      elements.localityStatus.textContent = `Valt lokalnamn: ${candidate.localName}`;
    });
    elements.localityResults.appendChild(button);
  }
}

async function loadAndRenderExistingTrees() {
  if (loadingExistingTrees) {
    return;
  }

  loadingExistingTrees = true;
  elements.loadExistingButton.disabled = true;
  elements.loadExistingButton.textContent = "Laddar...";

  try {
    existingTrees = await loadExistingTrees(getBounds());
    const layer = createExistingTreesLayer(existingTrees);
    setExistingLayer(layer);
    updateDuplicateWarning();
    void renderLocalityCandidates();
    const newCount = existingTrees.filter((tree) => tree.layerId === 0).length;
    const oldCount = existingTrees.filter((tree) => tree.layerId === 1).length;
    const otherCount = existingTrees.length - newCount - oldCount;
    const sourceText = otherCount > 0
      ? `${newCount} nya, ${oldCount} f.d. Trädportalen, ${otherCount} övriga`
      : `${newCount} nya, ${oldCount} f.d. Trädportalen`;
    setStatus(`Laddade ${existingTrees.length} trädposter (${sourceText}).`);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  } finally {
    loadingExistingTrees = false;
    elements.loadExistingButton.disabled = false;
    elements.loadExistingButton.textContent = "Ladda trädposter";
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

function updateSelectedPoint(point) {
  selectedPoint = point;
  setFormPosition(point);
  updateDuplicateWarning();
  void renderLocalityCandidates();
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
      void renderLocalityCandidates();
      setStatus(`GPS-position satt. Noggrannhet: ${Math.round(accuracy)} m.`);
    } catch (error) {
      console.error(error);
      setStatus(`GPS-fel: ${error.message}`);
    }
  });

  elements.loadExistingButton.addEventListener("click", loadAndRenderExistingTrees);
  elements.refreshLocalitiesButton?.addEventListener("click", () => { void renderLocalityCandidates(); });

  elements.resetFormButton.addEventListener("click", () => {
    resetTreeForm(elements.form);
    void renderLocalityCandidates();
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
      void renderLocalityCandidates();
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
    updateSelectedPoint(event.detail);
  });
}

async function main() {
  await initForm();

  initMap({
    onMapClick: updateSelectedPoint
  });

  bindEvents();
  renderDrafts();
  await loadAndRenderExistingTrees();
}

main().catch((error) => {
  console.error(error);
  setStatus(`Startfel: ${error.message}`);
});
