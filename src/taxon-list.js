function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function looksLikeHeader(row) {
  const lowered = row.map((cell) => cell.trim().toLowerCase());
  return lowered.some((cell) => ["artnamn", "svensktnamn", "svenskt namn", "scientificname", "vetenskapligtnamn", "vetenskapligt namn"].includes(cell));
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseCount(value) {
  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function parseDelimitedLine(line) {
  return stripBom(line).split(";").map((cell) => cell.trim());
}

function parseHeaderRows(lines) {
  const header = parseDelimitedLine(lines[0]);
  const map = new Map(header.map((name, index) => [normalizeKey(name), index]));
  const indexOf = (...names) => {
    for (const name of names) {
      const found = map.get(normalizeKey(name));
      if (found !== undefined) {
        return found;
      }
    }
    return -1;
  };

  const swedishIndex = indexOf("artnamn", "svenskt namn", "svensktNamn", "nameSv", "swedishName");
  const scientificIndex = indexOf("vetenskapligt namn", "vetenskapligtNamn", "scientificName", "latinName");
  const authorIndex = indexOf("auktor", "author");
  const redlistIndex = indexOf("rödlista", "redlist", "redlistCategory", "rödlistkategori");
  const countIndex = indexOf("antal", "count", "observationCount", "observationCount25y", "antal25ar");

  return lines.slice(1)
    .map(parseDelimitedLine)
    .map((row) => ({
      artName: row[swedishIndex] || "",
      scientificName: row[scientificIndex] || "",
      author: authorIndex >= 0 ? row[authorIndex] || "" : "",
      redlistCategory: redlistIndex >= 0 ? row[redlistIndex] || "" : "",
      observationCount: countIndex >= 0 ? parseCount(row[countIndex]) : 0
    }))
    .filter((item) => item.artName && item.scientificName);
}

function parseLegacyRows(text) {
  const cleaned = stripBom(text).replace(/\r/g, "\n");
  const pattern = /([^;\n]+);([^;\n]+);([^;\n]*);([^;\n]*);(\d+)/g;
  const rows = [];
  let match;

  while ((match = pattern.exec(cleaned)) !== null) {
    rows.push({
      artName: match[1].replace(/^\s+/, "").trim(),
      scientificName: match[2].trim(),
      author: match[3].trim(),
      redlistCategory: match[4].trim(),
      observationCount: parseCount(match[5])
    });
  }

  return rows.filter((item) => item.artName && item.scientificName);
}

function dedupeAndSort(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const key = normalizeKey(row.artName);
    const existing = grouped.get(key);

    if (!existing || row.observationCount > existing.observationCount) {
      grouped.set(key, row);
    }
  }

  return [...grouped.values()].sort((a, b) => {
    const countDiff = (b.observationCount || 0) - (a.observationCount || 0);
    if (countDiff !== 0) {
      return countDiff;
    }
    return a.artName.localeCompare(b.artName, "sv");
  });
}

export async function loadTaxonList(url = "data/TaxonList.csv") {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Kunde inte ladda artlistan (${response.status}).`);
  }

  const text = await response.text();
  const lines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const firstRow = parseDelimitedLine(lines[0]);
  const rows = looksLikeHeader(firstRow)
    ? parseHeaderRows(lines)
    : parseLegacyRows(text);

  return dedupeAndSort(rows);
}

export function findByArtName(taxa, value) {
  const key = normalizeKey(value);
  if (!key) {
    return null;
  }

  return taxa.find((item) => normalizeKey(item.artName) === key) || null;
}

export function findByScientificName(taxa, value) {
  const key = normalizeKey(value);
  if (!key) {
    return null;
  }

  return taxa.find((item) => normalizeKey(item.scientificName) === key) || null;
}
