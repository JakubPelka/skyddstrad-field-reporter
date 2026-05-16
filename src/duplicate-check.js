const EARTH_RADIUS_M = 6371008.8;

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

export function distanceM(a, b) {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lng - a.lng);

  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);

  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_M * c;
}

export function findNearbyTrees(point, existingTrees, thresholdM) {
  if (!point || !Array.isArray(existingTrees)) {
    return [];
  }

  return existingTrees
    .map((tree) => ({
      ...tree,
      distanceM: distanceM(point, tree)
    }))
    .filter((tree) => tree.distanceM <= thresholdM)
    .sort((a, b) => a.distanceM - b.distanceM);
}
