import { APP_CONFIG } from "./config.js";
import { distanceM } from "./duplicate-check.js";
import { asNumber, formatDistance } from "./util.js";

function getAccuracyM(properties) {
  return asNumber(properties?.noggrannhet ?? properties?.accuracy ?? properties?.coordinateAccuracyM);
}

function getLocalName(properties) {
  return properties?.lokalnamn || properties?.localName || properties?.localityName || "";
}

function getSourceRecordId(tree) {
  return tree?.properties?.id_artportalen || tree?.properties?.OBJECTID || tree?.properties?.objectid || tree?.id || "";
}

export function findLocalityCandidates(point, trees) {
  if (!point || !Array.isArray(trees)) {
    return [];
  }

  const groups = new Map();

  for (const tree of trees) {
    const localName = getLocalName(tree.properties);
    if (!localName) {
      continue;
    }

    const distance = distanceM(point, tree);
    if (distance > APP_CONFIG.localityCandidates.searchRadiusM) {
      continue;
    }

    const accuracyM = getAccuracyM(tree.properties);
    const isInsideAccuracy = Number.isFinite(accuracyM) && distance <= accuracyM;
    const existing = groups.get(localName);

    if (!existing || distance < existing.distanceM) {
      groups.set(localName, {
        localName,
        distanceM: distance,
        accuracyM,
        isInsideAccuracy,
        treeCount: existing?.treeCount || 1,
        sourceRecordId: getSourceRecordId(tree),
        species: tree.properties?.artnamn || tree.properties?.species || "",
        status: tree.properties?.tradstatus || tree.properties?.treeStatus || ""
      });
    } else {
      existing.treeCount += 1;
      if (isInsideAccuracy) {
        existing.isInsideAccuracy = true;
      }
    }
  }

  return [...groups.values()]
    .sort((a, b) => {
      if (a.isInsideAccuracy !== b.isInsideAccuracy) {
        return a.isInsideAccuracy ? -1 : 1;
      }

      return a.distanceM - b.distanceM;
    })
    .slice(0, APP_CONFIG.localityCandidates.maxCandidates);
}

export function candidateStatusText(candidate) {
  const mode = candidate.isInsideAccuracy
    ? APP_CONFIG.localityCandidates.insideAccuracyLabel
    : APP_CONFIG.localityCandidates.nearestLabel;

  const accuracy = Number.isFinite(candidate.accuracyM)
    ? ` · noggrannhet ${Math.round(candidate.accuracyM)} m`
    : "";

  return `${mode} · ${formatDistance(candidate.distanceM)} bort${accuracy}`;
}
