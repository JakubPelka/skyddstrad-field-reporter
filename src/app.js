import { APP_CONFIG } from "./config.js?v=20260517-position-three-buttons-v1";
import { findNearbyTrees } from "./duplicate-check.js?v=20260517-position-three-buttons-v1";
import { exportDraftsAsXlsx, shareDraftsAsXlsx } from "./export-xlsx.js?v=20260517-position-three-buttons-v1";
import { exportDraftsAsGeoJson } from "./export-geojson.js?v=20260517-position-three-buttons-v1";
import { getDraftFromForm, initForm, resetTreeForm, setFormPosition, setLocalName } from "./form.js?v=20260517-position-three-buttons-v1";
import { getCurrentPosition, watchCurrentPosition } from "./gps.js?v=20260517-position-three-buttons-v1";
import { getBounds, initMap, renderDraftMarkers, setExistingLayer, setSelectedPoint, showCurrentPosition } from "./map.js?v=20260517-position-three-buttons-v1";
import { addDraft, clearDrafts, deleteDraft, loadDrafts } from "./storage.js?v=20260517-position-three-buttons-v1";
import { createExistingTreesLayer, loadExistingTrees } from "./tree-layer.js?v=20260517-position-three-buttons-v1";
import { candidateStatusText, findLocalityCandidates } from "./locality-candidates.js?v=20260517-position-three-buttons-v1";
import { findMunicipalityCandidate } from "./municipality-boundaries.js?v=20260517-position-three-buttons-v1";
import { escapeHtml, formatDistance } from "./util.js?v=20260517-position-three-buttons-v1";

let existingTrees = [];
let selectedPoint = null;
let currentGpsPoint = null;
let treePositionLocked = false;
let loadingExistingTrees = false;
let stopGpsWatch = null;

const elements = {
  form: document.querySelector("#tree-form"),
  gpsStatus: document.querySelector("#gps-status"),
  treePositionStatus: document.querySelector("#tree-position-status"),
  duplicateWarning: document.querySelector("#duplicate-warning"),
  draftCount: document.querySelector("#draft-count"),
  draftList: document.querySelector("#draft-list"),
  draftTemplate: document.querySelector("#draft-item-template"),
  useGpsTreeButton: document.querySelector("#btn-use-gps-tree"),
  watchGpsButton: document.querySelector("#btn-watch-gps"),
  loadExistingButton: document.querySelector("#btn-load-existing"),
  resetFormButton: document.querySelector("#btn-reset-form"),
  exportXlsxButton: document.querySelector("#btn-export-xlsx"),
  shareXlsxButton: document.querySelector("#btn-share-xlsx"),
  exportGeoJsonButton: document.querySelector("#btn-export-geojson"),
  clearDraftsButton: document.querySelector("#btn-clear-drafts"),
  localityStatus: document.querySelector("#locality-status"),
  localityResults: document.querySelector("#locality-results"),
  refreshLocalitiesButton: document.querySelector("#btn-refresh-localities")
};

function setStatus(message) {
  elements.gpsStatus.textContent = message;
}

function setTreePositionStatus(message) {
  if (elements.treePositionStatus) {
    elements.treePositionStatus.textContent = message;
  }
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
    elements.localityStatus.textContent = "Välj punkt i kartan eller använd GPS som trädpunkt för att föreslå lokalnamn.";
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
    elements.loadExistingButton.textContent = "Ladda/uppdatera trädposter";
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

function setTreePoint(point, { lock = true, reason = "Trädpunkt vald" } = {}) {
  selectedPoint = {
    lat: point.lat,
    lng: point.lng
  };

  treePositionLocked = lock;
  setSelectedPoint(selectedPoint.lat, selectedPoint.lng, lock ? "Låst trädpunkt" : "GPS-baserad trädpunkt");
  setFormPosition({
    lat: selectedPoint.lat,
    lng: selectedPoint.lng,
    accuracyM: point.accuracyM ?? null
  });
  updateDuplicateWarning();
  void renderLocalityCandidates();

  setTreePositionStatus(lock
    ? `${reason}. GPS-följning kan fortsätta utan att skriva över trädets koordinater.`
    : "Trädpunkt följer GPS tills du klickar i kartan eller låser GPS som trädpunkt.");
}

function unlockTreePointForNextRecord() {
  treePositionLocked = false;

  if (currentGpsPoint) {
    setTreePoint(currentGpsPoint, {
      lock: false,
      reason: "Ny post kan använda aktuell GPS"
    });
  } else {
    selectedPoint = null;
    setTreePositionStatus("Trädpunkt är inte låst.");
    void renderLocalityCandidates();
  }
}

function applyGpsPosition(position, modeLabel = "GPS-position") {
  const { latitude, longitude, accuracy } = position.coords;

  currentGpsPoint = {
    lat: latitude,
    lng: longitude,
    accuracyM: accuracy
  };

  showCurrentPosition(latitude, longitude, accuracy);

  if (!treePositionLocked) {
    setTreePoint(currentGpsPoint, {
      lock: false,
      reason: "GPS uppdaterade trädpunkt"
    });
  }

  const lockText = treePositionLocked
    ? " Trädpunkt är låst och ändras inte."
    : " Trädpunkt följer GPS.";
  setStatus(`${modeLabel}. Noggrannhet: ${Math.round(accuracy)} m.${lockText}`);
}

async function useGpsAsTreePoint() {
  try {
    if (!currentGpsPoint) {
      setStatus("Läser GPS-position...");
      const position = await getCurrentPosition();
      applyGpsPosition(position, "GPS-position hämtad");
    }

    if (!currentGpsPoint) {
      throw new Error("Ingen GPS-position tillgänglig.");
    }

    setTreePoint(currentGpsPoint, {
      lock: true,
      reason: "GPS-position används som trädpunkt"
    });
    setStatus(`GPS används som låst trädpunkt. Noggrannhet: ${Math.round(currentGpsPoint.accuracyM)} m.`);
  } catch (error) {
    console.error(error);
    setStatus(`GPS-fel: ${error.message}`);
  }
}

function setGpsWatchActive(isActive) {
  if (!elements.watchGpsButton) {
    return;
  }

  elements.watchGpsButton.classList.toggle("is-active", isActive);
  elements.watchGpsButton.setAttribute("aria-pressed", isActive ? "true" : "false");
  elements.watchGpsButton.textContent = isActive ? "Stoppa GPS" : "GPS på";
}

function stopGpsTracking() {
  if (stopGpsWatch) {
    stopGpsWatch();
    stopGpsWatch = null;
  }

  setGpsWatchActive(false);
}

function startGpsTracking() {
  setStatus("Startar GPS-följning...");

  try {
    stopGpsWatch = watchCurrentPosition({
      onPosition: (position) => applyGpsPosition(position, "GPS uppdaterad"),
      onError: (error) => {
        console.error(error);
        setStatus(`GPS-fel: ${error.message}`);
      }
    });
    setGpsWatchActive(true);
  } catch (error) {
    console.error(error);
    setStatus(`GPS-fel: ${error.message}`);
  }
}

function bindEvents() {

  elements.useGpsTreeButton?.addEventListener("click", useGpsAsTreePoint);

  elements.watchGpsButton?.addEventListener("click", () => {
    if (stopGpsWatch) {
      stopGpsTracking();
      setStatus("GPS-följning stoppad.");
    } else {
      startGpsTracking();
    }
  });

  elements.loadExistingButton.addEventListener("click", loadAndRenderExistingTrees);
  elements.refreshLocalitiesButton?.addEventListener("click", () => { void renderLocalityCandidates(); });

  elements.resetFormButton.addEventListener("click", () => {
    resetTreeForm(elements.form);
    unlockTreePointForNextRecord();
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();

    elements.form.classList.add("was-validated");

    if (!elements.form.checkValidity()) {
      const firstInvalid = elements.form.querySelector(":invalid");
      firstInvalid?.scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
      firstInvalid?.focus({
        preventScroll: true
      });
      elements.form.reportValidity();
      return;
    }

    try {
      const draft = getDraftFromForm(elements.form);
      addDraft(draft);
      resetTreeForm(elements.form);
      elements.form.classList.remove("was-validated");
      renderDrafts();
      unlockTreePointForNextRecord();
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

  elements.shareXlsxButton?.addEventListener("click", async () => {
    const drafts = loadDrafts();

    if (drafts.length === 0) {
      alert("Det finns inga utkast att dela.");
      return;
    }

    try {
      await shareDraftsAsXlsx(drafts);
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
    setTreePoint(event.detail, {
      lock: true,
      reason: "Trädpunkt flyttad manuellt"
    });
  });

  window.addEventListener("pagehide", stopGpsTracking);
}

async function main() {
  await initForm();

  initMap({
    onMapClick: (point) => {
      setTreePoint(point, {
        lock: true,
        reason: "Trädpunkt vald i kartan"
      });
    }
  });

  bindEvents();
  renderDrafts();
  setTreePositionStatus("Trädpunkt är inte låst.");
  await loadAndRenderExistingTrees();
}

main().catch((error) => {
  console.error(error);
  setStatus(`Startfel: ${error.message}`);
});
