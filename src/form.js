import { asNumber, nowISO, todayISO, uuid } from "./util.js";

function fillSelect(select, options, placeholder = "Select") {
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

export async function initForm() {
  const [speciesResponse, valuesResponse] = await Promise.all([
    fetch("data/species.json"),
    fetch("data/form-values.json")
  ]);

  const species = await speciesResponse.json();
  const values = await valuesResponse.json();

  fillSelect(document.querySelector("#species"), species, "Select species");
  fillSelect(document.querySelector("#treeStatus"), values.treeStatus, "Unknown / not selected");
  fillSelect(document.querySelector("#hollowStage"), values.hollowStage, "Unknown / not selected");
  fillSelect(document.querySelector("#hollowPosition"), values.hollowPosition, "Unknown / not selected");
  fillSelect(document.querySelector("#vitality"), values.vitality, "Unknown / not selected");
  fillSelect(document.querySelector("#managementNeed"), values.managementNeed, "Unknown / not selected");

  document.querySelector("#observationDate").value = todayISO();
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
    throw new Error("Latitude and longitude are required.");
  }

  return {
    id: uuid(),
    observationDate: String(formData.get("observationDate") || todayISO()),
    species: String(formData.get("species") || ""),
    scientificName: selectedSpecies?.dataset?.scientificName || "",
    latitude,
    longitude,
    coordinateAccuracyM: asNumber(formData.get("coordinateAccuracyM")),
    stemCircumferenceCm: asNumber(formData.get("stemCircumferenceCm")),
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
