import { asNumber, nowISO, todayISO, uuid } from "./util.js";

function fillSelect(select, options, placeholder = "Välj") {
  select.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.appendChild(empty);

  for (const option of options) {
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
  fillSelect(document.querySelector("#hollowPosition"), values.hollowPosition, "Okänt / ej valt");
  fillSelect(document.querySelector("#vitality"), values.vitality, "Okänt / ej valt");
  fillSelect(document.querySelector("#managementNeed"), values.managementNeed, "Okänt / ej valt");

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

  const latitude = asNumber(formData.get("latitude"));
  const longitude = asNumber(formData.get("longitude"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Latitud och longitud måste anges.");
  }

  return {
    id: uuid(),
    observationDate: String(formData.get("observationDate") || todayISO()),
    localName: String(formData.get("localName") || ""),
    species: String(formData.get("species") || ""),
    scientificName: selectedSpecies?.dataset?.scientificName || "",
    latitude,
    longitude,
    coordinateAccuracyM: asNumber(formData.get("coordinateAccuracyM")),
    stemCircumferenceCm: asNumber(formData.get("stemCircumferenceCm")),
    stemDiameterCm: asNumber(formData.get("stemDiameterCm")),
    treeStatus: String(formData.get("treeStatus") || ""),
    hollowStage: String(formData.get("hollowStage") || ""),
    hollowPosition: String(formData.get("hollowPosition") || ""),
    vitality: String(formData.get("vitality") || ""),
    managementNeed: String(formData.get("managementNeed") || ""),
    observer: String(formData.get("observer") || ""),
    comment: String(formData.get("comment") || ""),
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
}
