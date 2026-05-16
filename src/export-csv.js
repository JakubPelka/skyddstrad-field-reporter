import { FIELD_EXPORT_ORDER } from "./config.js";
import { downloadBlob } from "./util.js";

function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\n\r;]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function draftsToCsv(drafts) {
  const header = FIELD_EXPORT_ORDER.join(",");
  const rows = drafts.map((draft) =>
    FIELD_EXPORT_ORDER.map((key) => csvEscape(draft[key])).join(",")
  );

  return [header, ...rows].join("\n");
}

export function exportDraftsAsCsv(drafts) {
  const csv = draftsToCsv(drafts);
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

  downloadBlob(`skyddstrad_drafts_${date}.csv`, blob);
}
