import { FIELD_EXPORT_ORDER, FIELD_LABELS_SV } from "./config.js";

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
}

function buildRows(drafts) {
  const headers = FIELD_EXPORT_ORDER.map((key) => FIELD_LABELS_SV[key] || key);
  const rows = drafts.map((draft) => FIELD_EXPORT_ORDER.map((key) => normalizeValue(draft[key])));
  return [headers, ...rows];
}

function buildColumnWidths() {
  return FIELD_EXPORT_ORDER.map((key) => {
    if (["comment", "localName"].includes(key)) {
      return { wch: 34 };
    }

    if (["id", "createdAt"].includes(key)) {
      return { wch: 28 };
    }

    if (["species", "scientificName", "treeStatus", "hollowStage", "hollowPosition", "vitality", "managementNeed"].includes(key)) {
      return { wch: 22 };
    }

    return { wch: 16 };
  });
}

export function exportDraftsAsXlsx(drafts) {
  if (!window.XLSX) {
    throw new Error("XLSX-biblioteket kunde inte laddas. Kontrollera internetanslutning eller CDN-laddning.");
  }

  const rows = buildRows(drafts);
  const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = buildColumnWidths();

  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "Fältdata");

  const date = new Date().toISOString().slice(0, 10);
  window.XLSX.writeFile(workbook, `skyddsvarda_trad_utkast_${date}.xlsx`);
}
