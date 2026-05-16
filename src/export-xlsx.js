import {
  ARTPORTALEN_OBSERVATION_HEADERS,
  ARTPORTALEN_TEMPLATE,
  PARAMETER_SHEET_COLUMNS
} from "./config.js";

const PARAMETER_VALUES = {
  "Trädstatus": [
    "Levande",
    "Dött stående",
    "Dött liggande",
    "Träd saknas"
  ],
  "Hålstadium": [
    "Inga hål synliga",
    "Ingångshål <10 cm i diameter",
    "Ingångshål 10-19 cm i diameter",
    "Ingångshål 20-29 cm i diameter",
    "Ingångshål >= 30 cm i diameter"
  ],
  "Specificering av hål": [
    "I stam ovan mark",
    "I stam med markkontakt"
  ],
  "Mulmvolym": [
    "Mulmvolym ej bedömningsbar",
    "<10 liter mulm",
    "10 liter - 1 m3 mulm",
    "> 1 m3 mulm"
  ],
  "Åtgärdsbehov": [
    "Akut (inom 2 år)",
    "Snart (inom 3 -10 år)",
    "Framtida (>10 år)",
    "Inget"
  ],
  "Karaktärsdrag": [
    "Ej bedömt",
    "Stackmyror (endast Formica rufa-gruppen)",
    "Brandspår",
    "Spärrgrenigt träd",
    "Barklös stamved",
    "Savflöde",
    "Övrigt",
    "Askskottsjuka",
    "Almsjuka",
    "Toppbrott/toppkapat (när huvudstammen är av)",
    "Stora delar av kronan beskuren eller avbruten (när flera huvudgrenar är av)"
  ],
  "Vedväxter och täckningsgrad": [
    "Ingen vegetation",
    "< 25%",
    "25 - 75%",
    "> 75%",
    "Täckning okänd"
  ],
  "Omgivning": [
    "Allé",
    "Vägkant",
    "Kyrkogård",
    "Park",
    "Tomt",
    "Lövskog",
    "Barrskog",
    "Blandskog",
    "Hygge",
    "Gräsmark",
    "Åker/vall",
    "Vatten",
    "Bebyggelse",
    "Övrigt"
  ],
  "Pågående markanvändning": [
    "Avverkning",
    "Bete",
    "Röjning / gallring",
    "Markarbete",
    "Slåtter",
    "Inget",
    "Övrigt"
  ]
};

function valueOrBlank(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
}

function buildObservationTopRow() {
  const row = new Array(ARTPORTALEN_OBSERVATION_HEADERS.length).fill("");
  row[3] = ARTPORTALEN_TEMPLATE.projectName;
  row[6] = ARTPORTALEN_TEMPLATE.version;
  row[27] = "Projektparametrar";
  return row;
}

function draftToObservationRow(draft) {
  const row = new Array(ARTPORTALEN_OBSERVATION_HEADERS.length).fill("");

  row[0] = valueOrBlank(draft.species);
  row[1] = 1;
  row[3] = valueOrBlank(draft.localName);
  row[4] = valueOrBlank(draft.longitude);
  row[5] = valueOrBlank(draft.latitude);
  row[6] = valueOrBlank(draft.coordinateAccuracyM);
  row[7] = valueOrBlank(draft.observationDate);
  row[8] = valueOrBlank(draft.comment);

  row[27] = valueOrBlank(draft.treeStatus);
  row[28] = valueOrBlank(draft.vitalityPercent);
  row[29] = valueOrBlank(draft.stemCircumferenceCm);
  row[30] = valueOrBlank(draft.hollowStage);
  row[31] = valueOrBlank(draft.holeSpecification || draft.hollowPosition);
  row[32] = valueOrBlank(draft.mulmVolume);
  row[33] = valueOrBlank(draft.managementNeed);
  row[34] = valueOrBlank(draft.characteristic1);
  row[35] = valueOrBlank(draft.characteristic2);
  row[36] = valueOrBlank(draft.characteristic3);
  row[37] = valueOrBlank(draft.pollardBranchDiameterCm);
  row[38] = valueOrBlank(draft.woodyShrubsUnderCrown);
  row[39] = valueOrBlank(draft.woodyYoungTreesUnderCrown);
  row[40] = valueOrBlank(draft.woodyBroadleafPineUnderCrown);
  row[41] = valueOrBlank(draft.woodySpruceUnderCrown);
  row[42] = valueOrBlank(draft.woodyShrubsOutsideCrown);
  row[43] = valueOrBlank(draft.woodyYoungTreesOutsideCrown);
  row[44] = valueOrBlank(draft.woodyBroadleafPineOutsideCrown);
  row[45] = valueOrBlank(draft.woodySpruceOutsideCrown);
  row[46] = valueOrBlank(draft.surrounding1);
  row[47] = valueOrBlank(draft.surrounding2);
  row[48] = valueOrBlank(draft.surrounding3);
  row[49] = valueOrBlank(draft.landUse);

  return row;
}

function buildObservationRows(drafts) {
  return [
    buildObservationTopRow(),
    ARTPORTALEN_OBSERVATION_HEADERS,
    ...drafts.map(draftToObservationRow)
  ];
}

function buildParameterRows() {
  const maxLength = Math.max(...PARAMETER_SHEET_COLUMNS.map((header) => PARAMETER_VALUES[header].length));
  const rows = [PARAMETER_SHEET_COLUMNS];

  for (let i = 0; i < maxLength; i += 1) {
    rows.push(PARAMETER_SHEET_COLUMNS.map((header) => PARAMETER_VALUES[header][i] || ""));
  }

  return rows;
}

function buildObservationColumnWidths() {
  return ARTPORTALEN_OBSERVATION_HEADERS.map((header) => {
    if (["Publik kommentar", "Intressant kommentar", "Privat kommentar"].includes(header)) {
      return { wch: 32 };
    }

    if (header.startsWith("Vedartad")) {
      return { wch: 28 };
    }

    if (["Lokalnamn", "Artnamn", "Trädstatus", "Hålstadium", "Specificering av hål", "Mulmvolym", "Åtgärdsbehov"].includes(header)) {
      return { wch: 24 };
    }

    return { wch: 15 };
  });
}

function buildParameterColumnWidths() {
  return PARAMETER_SHEET_COLUMNS.map((header) => {
    if (["Karaktärsdrag"].includes(header)) {
      return { wch: 58 };
    }

    if (["Vedväxter och täckningsgrad", "Pågående markanvändning"].includes(header)) {
      return { wch: 30 };
    }

    return { wch: 26 };
  });
}

export function exportDraftsAsXlsx(drafts) {
  if (!window.XLSX) {
    throw new Error("XLSX-biblioteket kunde inte laddas. Kontrollera internetanslutning eller CDN-laddning.");
  }

  const workbook = window.XLSX.utils.book_new();

  const observationWorksheet = window.XLSX.utils.aoa_to_sheet(buildObservationRows(drafts));
  observationWorksheet["!cols"] = buildObservationColumnWidths();
  observationWorksheet["!freeze"] = { xSplit: 0, ySplit: 2 };
  window.XLSX.utils.book_append_sheet(workbook, observationWorksheet, ARTPORTALEN_TEMPLATE.observationSheetName);

  const parameterWorksheet = window.XLSX.utils.aoa_to_sheet(buildParameterRows());
  parameterWorksheet["!cols"] = buildParameterColumnWidths();
  window.XLSX.utils.book_append_sheet(workbook, parameterWorksheet, ARTPORTALEN_TEMPLATE.parameterSheetName);

  const date = new Date().toISOString().slice(0, 10);
  window.XLSX.writeFile(workbook, `skyddsvarda_trad_artportalen_observationer_${date}.xlsx`);
}
