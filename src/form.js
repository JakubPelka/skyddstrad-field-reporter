import { findByArtName, findByScientificName, loadTaxonList } from "./taxon-list.js?v=20260517-share-gps-sst-validation-v1";
import { asNumber, nowISO, todayISO, uuid } from "./util.js";

let taxonList = [];
let taxonSyncing = false;

function fillSelect(select, options, placeholder = "Välj") {
  if (!select) {
    return;
  }

  select.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.appendChild(empty);

  for (const option of options || []) {
    const item = document.createElement("option");
    item.value = option.value ?? option.label ?? option;
    item.textContent = option.label ?? option.value ?? option;
    select.appendChild(item);
  }
}

function getText(formData, name) {
  return String(formData.get(name) || "");
}

function getNumber(formData, name) {
  return asNumber(formData.get(name));
}

function formatQuickTreeMeasure(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return value.toFixed(1);
}

function setupCircumferenceDiameterSync() {
  const circumferenceInput = document.querySelector("#stemCircumferenceCm");
  const diameterInput = document.querySelector("#stemDiameterCm");

  if (!circumferenceInput || !diameterInput) {
    return;
  }

  let syncing = false;

  circumferenceInput.addEventListener("input", () => {
    if (syncing) {
      return;
    }

    const circumference = asNumber(circumferenceInput.value);
    syncing = true;
    diameterInput.value = circumference === null ? "" : formatQuickTreeMeasure(circumference / Math.PI);
    syncing = false;
    updateSstStatus();
  });

  diameterInput.addEventListener("input", () => {
    if (syncing) {
      return;
    }

    const diameter = asNumber(diameterInput.value);
    syncing = true;
    circumferenceInput.value = diameter === null ? "" : formatQuickTreeMeasure(diameter * Math.PI);
    syncing = false;
    updateSstStatus();
  });
}

function setTaxonStatus(message, variant = "info") {
  const status = document.querySelector("#taxon-status");

  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.variant = variant;
}

function updateSstStatus() {
  const status = document.querySelector("#sst-status");
  const circumference = asNumber(document.querySelector("#stemCircumferenceCm")?.value);
  const hollowStage = document.querySelector("#hollowStage")?.value || "";

  if (!status) {
    return;
  }

  if (circumference === null && !hollowStage) {
    status.textContent = "SST-kontroll görs när stamomkrets och hålstadium är ifyllda. Ålderskriteriet kontrolleras inte i appen.";
    status.dataset.variant = "info";
    return;
  }

  const draftLike = {
    stemCircumferenceCm: circumference,
    hollowStage
  };
  const result = evaluateSstCandidate(draftLike);
  status.textContent = sstStatusText(draftLike);
  status.dataset.variant = result.passes ? "ok" : "warning";
}

function fillTaxonDatalists(taxa) {
  const artDatalist = document.querySelector("#taxon-art-options");
  const scientificDatalist = document.querySelector("#taxon-scientific-options");

  if (artDatalist) {
    artDatalist.innerHTML = "";
  }

  if (scientificDatalist) {
    scientificDatalist.innerHTML = "";
  }

  for (const item of taxa) {
    if (artDatalist) {
      const option = document.createElement("option");
      option.value = item.artName;
      option.label = item.scientificName;
      artDatalist.appendChild(option);
    }

    if (scientificDatalist) {
      const option = document.createElement("option");
      option.value = item.scientificName;
      option.label = item.artName;
      scientificDatalist.appendChild(option);
    }
  }
}

function applyTaxonMatch(match, source) {
  const artInput = document.querySelector("#species");
  const scientificInput = document.querySelector("#scientificName");

  if (!match || !artInput || !scientificInput) {
    return;
  }

  taxonSyncing = true;

  if (source === "art") {
    scientificInput.value = match.scientificName;
  } else if (source === "scientific") {
    artInput.value = match.artName;
  }

  taxonSyncing = false;

  const countText = match.observationCount
    ? ` · ${match.observationCount} rapporter i underlaget`
    : "";

  const redlistText = match.redlistCategory
    ? ` · rödlista: ${match.redlistCategory}`
    : "";

  setTaxonStatus(`Matchad: ${match.artName} / ${match.scientificName}${redlistText}${countText}.`, "ok");
}

function setupTaxonSync() {
  const artInput = document.querySelector("#species");
  const scientificInput = document.querySelector("#scientificName");

  if (!artInput || !scientificInput) {
    return;
  }

  artInput.addEventListener("input", () => {
    if (taxonSyncing) {
      return;
    }

    const value = artInput.value.trim();

    if (!value) {
      scientificInput.value = "";
      setTaxonStatus("Ange artnamn eller vetenskapligt namn. Fältet använder lokal TaxonList.csv.", "info");
      return;
    }

    const match = findByArtName(taxonList, value);

    if (match) {
      applyTaxonMatch(match, "art");
    } else {
      scientificInput.value = "";
      setTaxonStatus("Artnamnet finns inte i lokal TaxonList.csv. Kontrollera innan import.", "warning");
    }
  });

  scientificInput.addEventListener("input", () => {
    if (taxonSyncing) {
      return;
    }

    const value = scientificInput.value.trim();

    if (!value) {
      artInput.value = "";
      setTaxonStatus("Ange artnamn eller vetenskapligt namn. Fältet använder lokal TaxonList.csv.", "info");
      return;
    }

    const match = findByScientificName(taxonList, value);

    if (match) {
      applyTaxonMatch(match, "scientific");
    } else {
      artInput.value = "";
      setTaxonStatus("Vetenskapligt namn finns inte i lokal TaxonList.csv. Kontrollera innan import.", "warning");
    }
  });
}

function validatePercent(value, label) {
  if (value === null) {
    return;
  }

  if (value < 0 || value > 100) {
    throw new Error(`${label} måste vara mellan 0 och 100.`);
  }
}

function requireText(formData, name, label) {
  const value = getText(formData, name).trim();

  if (!value) {
    throw new Error(`${label} måste fyllas i.`);
  }

  return value;
}

function requireNumber(formData, name, label) {
  const value = getNumber(formData, name);

  if (!Number.isFinite(value)) {
    throw new Error(`${label} måste fyllas i.`);
  }

  return value;
}

async function initTaxonList() {
  try {
    taxonList = await loadTaxonList();
    fillTaxonDatalists(taxonList);
    setTaxonStatus(`Artlistan laddad: ${taxonList.length} poster från TaxonList.csv.`, "ok");
  } catch (error) {
    console.error(error);
    taxonList = [];
    setTaxonStatus("Kunde inte ladda TaxonList.csv. Art kan fortfarande skrivas manuellt men måste kontrolleras.", "warning");
  }

  setupTaxonSync();
}

export async function initForm() {
  const valuesResponse = await fetch("data/form-values.json");
  const values = await valuesResponse.json();

  await initTaxonList();

  fillSelect(document.querySelector("#treeStatus"), values.treeStatus, "Välj trädstatus");
  fillSelect(document.querySelector("#hollowStage"), values.hollowStage, "Välj hålstadium");
  document.querySelector("#hollowStage")?.addEventListener("change", updateSstStatus);
  fillSelect(document.querySelector("#managementNeed"), values.managementNeed, "Välj åtgärdsbehov");
  fillSelect(document.querySelector("#holeSpecification"), values.holeSpecification, "Ej valt");
  fillSelect(document.querySelector("#mulmVolume"), values.mulmVolume, "Ej valt");
  fillSelect(document.querySelector("#characteristic1"), values.characteristics, "Ej valt");
  fillSelect(document.querySelector("#characteristic2"), values.characteristics, "Ej valt");
  fillSelect(document.querySelector("#characteristic3"), values.characteristics, "Ej valt");
  fillSelect(document.querySelector("#woodyShrubsUnderCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodyYoungTreesUnderCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodyBroadleafPineUnderCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodySpruceUnderCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodyShrubsOutsideCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodyYoungTreesOutsideCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodyBroadleafPineOutsideCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#woodySpruceOutsideCrown"), values.vegetationCoverage, "Ej valt");
  fillSelect(document.querySelector("#surrounding1"), values.surrounding, "Ej valt");
  fillSelect(document.querySelector("#surrounding2"), values.surrounding, "Ej valt");
  fillSelect(document.querySelector("#surrounding3"), values.surrounding, "Ej valt");
  fillSelect(document.querySelector("#landUse"), values.landUse, "Ej valt");

  const dateInput = document.querySelector("#observationDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = todayISO();
  }

  setupCircumferenceDiameterSync();
  updateSstStatus();
}

export function setFormPosition({ lat, lng, accuracyM = null }) {
  document.querySelector("#latitude").value = lat.toFixed(6);
  document.querySelector("#longitude").value = lng.toFixed(6);

  if (accuracyM !== null && Number.isFinite(accuracyM)) {
    document.querySelector("#coordinateAccuracyM").value = accuracyM.toFixed(1);
  }
}

export function setLocalName(localName, localityId = "") {
  const localNameInput = document.querySelector("#localName");
  const localityIdInput = document.querySelector("#localityId");

  if (localNameInput) {
    localNameInput.value = localName || "";
  }

  if (localityIdInput) {
    localityIdInput.value = localityId || "";
  }
}

export function getDraftFromForm(form) {
  const formData = new FormData(form);

  const species = requireText(formData, "species", "Artnamn");
  const observationDate = requireText(formData, "observationDate", "Observationsdatum");
  const localName = requireText(formData, "localName", "Lokalnamn i Artportalen");
  const latitude = requireNumber(formData, "latitude", "Norr/latitud");
  const longitude = requireNumber(formData, "longitude", "Öst/longitud");
  const coordinateAccuracyM = requireNumber(formData, "coordinateAccuracyM", "Noggrannhet");
  const stemCircumferenceCm = requireNumber(formData, "stemCircumferenceCm", "Stamomkrets");
  const treeStatus = requireText(formData, "treeStatus", "Trädstatus");
  const hollowStage = requireText(formData, "hollowStage", "Hålstadium");
  const managementNeed = requireText(formData, "managementNeed", "Åtgärdsbehov");
  const vitalityPercent = requireNumber(formData, "vitalityPercent", "Vitalitet levande träd (%)");

  validatePercent(vitalityPercent, "Vitalitet levande träd (%)");

  const sstCheck = evaluateSstCandidate({
    stemCircumferenceCm,
    hollowStage
  });

  if (!sstCheck.passes) {
    throw new Error(`SST-kontrollen stoppar sparande: ${sstCheck.reason}`);
  }

  return {
    id: uuid(),
    observationDate,
    localName,
    localityId: getText(formData, "localityId"),
    species,
    scientificName: getText(formData, "scientificName"),
    latitude,
    longitude,
    coordinateAccuracyM,
    stemCircumferenceCm,
    stemDiameterCm: getNumber(formData, "stemDiameterCm"),
    treeStatus,
    vitalityPercent,
    hollowStage,
    holeSpecification: getText(formData, "holeSpecification"),
    mulmVolume: getText(formData, "mulmVolume"),
    managementNeed,
    characteristic1: getText(formData, "characteristic1"),
    characteristic2: getText(formData, "characteristic2"),
    characteristic3: getText(formData, "characteristic3"),
    pollardBranchDiameterCm: getNumber(formData, "pollardBranchDiameterCm"),
    woodyShrubsUnderCrown: getText(formData, "woodyShrubsUnderCrown"),
    woodyYoungTreesUnderCrown: getText(formData, "woodyYoungTreesUnderCrown"),
    woodyBroadleafPineUnderCrown: getText(formData, "woodyBroadleafPineUnderCrown"),
    woodySpruceUnderCrown: getText(formData, "woodySpruceUnderCrown"),
    woodyShrubsOutsideCrown: getText(formData, "woodyShrubsOutsideCrown"),
    woodyYoungTreesOutsideCrown: getText(formData, "woodyYoungTreesOutsideCrown"),
    woodyBroadleafPineOutsideCrown: getText(formData, "woodyBroadleafPineOutsideCrown"),
    woodySpruceOutsideCrown: getText(formData, "woodySpruceOutsideCrown"),
    surrounding1: getText(formData, "surrounding1"),
    surrounding2: getText(formData, "surrounding2"),
    surrounding3: getText(formData, "surrounding3"),
    landUse: getText(formData, "landUse"),
    observer: getText(formData, "observer"),
    comment: getText(formData, "comment"),
    createdAt: nowISO()
  };
}

export function resetTreeForm(form) {
  const lat = document.querySelector("#latitude").value;
  const lng = document.querySelector("#longitude").value;
  const accuracy = document.querySelector("#coordinateAccuracyM").value;

  form.reset();
  form.classList.remove("was-validated");
  document.querySelector("#observationDate").value = todayISO();
  document.querySelector("#latitude").value = lat;
  document.querySelector("#longitude").value = lng;
  document.querySelector("#coordinateAccuracyM").value = accuracy;

  const localityId = document.querySelector("#localityId");
  if (localityId) {
    localityId.value = "";
  }

  setTaxonStatus(`Artlistan laddad: ${taxonList.length} poster från TaxonList.csv.`, "ok");
  updateSstStatus();
}
