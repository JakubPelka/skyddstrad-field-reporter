import { APP_CONFIG } from "./config.js?v=20260516-municipality-fallback-v1";
import { findNearbyTrees } from "./duplicate-check.js?v=20260516-municipality-fallback-v1";
import { exportDraftsAsXlsx } from "./export-xlsx.js?v=20260516-municipality-fallback-v1";
import { exportDraftsAsGeoJson } from "./export-geojson.js?v=20260516-municipality-fallback-v1";
import { getDraftFromForm, initForm, resetTreeForm, setFormPosition, setLocalName } from "./form.js?v=20260516-municipality-fallback-v1";
import { getCurrentPosition } from "./gps.js?v=20260516-municipality-fallback-v1";
import { getBounds, initMap, renderDraftMarkers, setExistingLayer, showCurrentPosition } from "./map.js?v=20260516-municipality-fallback-v1";
import { addDraft, clearDrafts, deleteDraft, loadDrafts } from "./storage.js?v=20260516-municipality-fallback-v1";
import { createExistingTreesLayer, loadExistingTrees } from "./tree-layer.js?v=20260516-municipality-fallback-v1";
import { candidateStatusText, findLocalityCandidates } from "./locality-candidates.js?v=20260516-municipality-fallback-v1";
import { escapeHtml, formatDistance } from "./util.js?v=20260516-municipality-fallback-v1";

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
  refreshLocalitiesButton: document.querySelector("#btn-refresh-localities"),
  municipalityFallbackButton: document.querySelector("#btn-municipality-fallback"),
  municipalityStatus: document.querySelector("#municipality-status"),
  municipalityResults: document.querySelector("#municipality-results")
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

function renderMunicipalityCandidate(candidate) {
  if (!elements.municipalityResults || !elements.municipalityStatus) {
    return;
  }

  elements.municipalityResults.innerHTML = "";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "locality-result municipality-result";
  button.innerHTML = `
    <strong>${escapeHtml(candidate.localName)}</strong>
    <span>fallback från kommunnamn · ${escapeHtml(candidate.source)}</span>
    <small>Kontrollera att namnet accepteras som Lokalnamn i Artportalen.</small>
  `;
  button.addEventListener("click", () => {
    setLocalName(candidate.localName, "");
    elements.municipalityStatus.textContent = `Valt kommunförslag: ${candidate.localName}`;
  });

  elements.municipalityResults.appendChild(button);
  elements.municipalityStatus.textContent = "Kommunförslag hittat.";
}

async function fetchAndRenderMunicipalityFallback() {
  if (!selectedPoint) {
    elements.municipalityStatus.textContent = "Välj en punkt i kartan eller använd GPS först.";
    return;
  }

  elements.municipalityFallbackButton.disabled = true;
  elements.municipalityFallbackButton.textContent = "Hämtar...";

  try {
    const candidate = await fetchMunicipalityFallback(selectedPoint);
    renderMunicipalityCandidate(candidate);
  } catch (error) {
    console.error(error);
    elements.municipalityStatus.textContent = error.message;
    elements.municipalityResults.innerHTML = "";
  } finally {
    elements.municipalityFallbackButton.disabled = false;
    elements.municipalityFallbackButton.textContent = "Föreslå kommunnamn";
  }
}

function renderLocalityCandidates() {
  if (!elements.localityResults || !elements.localityStatus) {
    return;
  }

  elements.localityResults.innerHTML = "";

  if (!selectedPoint) {
    elements.localityStatus.textContent = "Välj punkt i kartan eller använd GPS för att föreslå lokalnamn.";
    return;
  }

  if (existingTrees.length === 0) {
    elements.localityStatus.textContent = "Inga befintliga trädposter är laddade ännu.";
    return;
  }

  const candidates = findLocalityCandidates(selectedPoint, existingTrees);

  if (candidates.length === 0) {
    elements.localityStatus.textContent = `Inga lokalnamn hittades inom ${APP_CONFIG.localityCandidates.searchRadiusM} m. Använd kommunförslag som fallback eller skriv exakt lokalnamn manuellt.`;
    return;
  }

  elements.localityStatus.textContent = `Hittade ${candidates.length} kandidat(er) från laddade trädposter.`;

  for (const candidate of candidates) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "locality-result";
    button.innerHTML = `
      <strong>${escapeHtml(candidate.localName)}</strong>
      <span>${escapeHtml(candidateStatusText(candidate))}</span>
      <small>${candidate.treeCount} trädpost(er)${candidate.species ? ` · ${escapeHtml(candidate.species)}` : ""}</small>
    `;
    button.addEventListener("click", () => {
      setLocalName(candidate.localName, candidate.sourceRecordId || "");
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
    renderLocalityCandidates();
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
  renderLocalityCandidates();
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
      renderLocalityCandidates();
      setStatus(`GPS-position satt. Noggrannhet: ${Math.round(accuracy)} m.`);
    } catch (error) {
      console.error(error);
      setStatus(`GPS-fel: ${error.message}`);
    }
  });

  elements.loadExistingButton.addEventListener("click", loadAndRenderExistingTrees);
  elements.refreshLocalitiesButton?.addEventListener("click", renderLocalityCandidates);
  elements.municipalityFallbackButton?.addEventListener("click", fetchAndRenderMunicipalityFallback);

  elements.resetFormButton.addEventListener("click", () => {
    resetTreeForm(elements.form);
    renderLocalityCandidates();
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
      renderLocalityCandidates();
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
