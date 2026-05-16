import { asNumber, nowISO, todayISO, uuid } from "./util.js";

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

    if (option.scientificName) {
      item.dataset.scientificName = option.scientificName;
    }

    select.appendChild(item);
  }
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
    diameterInput.value = circumference === null
      ? ""
      : formatQuickTreeMeasure(circumference / Math.PI);
    syncing = false;
  });

  diameterInput.addEventListener("input", () => {
    if (syncing) {
      return;
    }

    const diameter = asNumber(diameterInput.value);
    syncing = true;
    circumferenceInput.value = diameter === null
      ? ""
      : formatQuickTreeMeasure(diameter * Math.PI);
    syncing = false;
  });
}

function getText(formData, name) {
  return String(formData.get(name) || "");
}

function getNumber(formData, name) {
  return asNumber(formData.get(name));
}

function validatePercent(value, label) {
  if (value === null) {
    return;
  }

  if (value < 0 || value > 100) {
    throw new Error(`${label} måste vara mellan 0 och 100.`);
  }
}

export async function initForm() {
  const [speciesResponse, valuesResponse] = await Promise.all([
    fetch("data/species.json"),
    fetch("data/form-values.json")
  ]);

  const species = await speciesResponse.json();
  const values = await valuesResponse.json();

  fillSelect(document.querySelector("#species"), species, "Välj art");
  fillSelect(document.querySelector("#treeStatus"), values.treeStatus, "Okänt / ej valt");
  fillSelect(document.querySelector("#hollowStage"), values.hollowStage, "Okänt / ej valt");
  fillSelect(document.querySelector("#holeSpecification"), values.holeSpecification, "Okänt / ej valt");
  fillSelect(document.querySelector("#mulmVolume"), values.mulmVolume, "Okänt / ej valt");
  fillSelect(document.querySelector("#managementNeed"), values.managementNeed, "Okänt / ej valt");

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

  document.querySelector("#observationDate").value = todayISO();
  setupCircumferenceDiameterSync();
}

export function setFormPosition({ lat, lng, accuracyM = null }) {
  document.querySelector("#latitude").value = lat.toFixed(6);
  document.querySelector("#longitude").value = lng.toFixed(6);

  if (accuracyM !== null && Number.isFinite(accuracyM)) {
    document.querySelector("#coordinateAccuracyM").value = accuracyM.toFixed(1);
  }
}

export function getDraftFromForm(form) {
  const formData = new FormData(form);
  const speciesSelect = document.querySelector("#species");
  const selectedSpecies = speciesSelect.selectedOptions[0];

  const latitude = getNumber(formData, "latitude");
  const longitude = getNumber(formData, "longitude");
  const vitalityPercent = getNumber(formData, "vitalityPercent");

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Norr/latitud och Öst/longitud måste anges.");
  }

  validatePercent(vitalityPercent, "Vitalitet levande träd (%)");

  return {
    id: uuid(),
    observationDate: getText(formData, "observationDate") || todayISO(),
    localName: getText(formData, "localName"),
    localityId: getText(formData, "localityId"),
    species: getText(formData, "species"),
    scientificName: selectedSpecies?.dataset?.scientificName || "",
    latitude,
    longitude,
    coordinateAccuracyM: getNumber(formData, "coordinateAccuracyM"),
    stemCircumferenceCm: getNumber(formData, "stemCircumferenceCm"),
    stemDiameterCm: getNumber(formData, "stemDiameterCm"),
    treeStatus: getText(formData, "treeStatus"),
    vitalityPercent,
    hollowStage: getText(formData, "hollowStage"),
    holeSpecification: getText(formData, "holeSpecification"),
    mulmVolume: getText(formData, "mulmVolume"),
    managementNeed: getText(formData, "managementNeed"),
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
  document.querySelector("#observationDate").value = todayISO();
  document.querySelector("#latitude").value = lat;
  document.querySelector("#longitude").value = lng;
  document.querySelector("#coordinateAccuracyM").value = accuracy;
  document.querySelector("#localityId").value = "";
}
