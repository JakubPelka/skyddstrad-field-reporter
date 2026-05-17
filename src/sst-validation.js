const GIANT_TREE_MIN_DIAMETER_CM = 100;
const HOLLOW_TREE_MIN_DIAMETER_CM = 40;

const GIANT_TREE_MIN_CIRCUMFERENCE_CM = Math.PI * GIANT_TREE_MIN_DIAMETER_CM;
const HOLLOW_TREE_MIN_CIRCUMFERENCE_CM = Math.PI * HOLLOW_TREE_MIN_DIAMETER_CM;

function hasDevelopedCavity(hollowStage) {
  const value = String(hollowStage || "").trim().toLowerCase();

  if (!value) {
    return false;
  }

  return !value.includes("inga hål synliga");
}

function round(value) {
  return Math.round(value);
}

export function evaluateSstCandidate(draft) {
  const circumference = Number(draft?.stemCircumferenceCm);
  const hollowStage = draft?.hollowStage || "";

  if (!Number.isFinite(circumference)) {
    return {
      passes: false,
      reason: "Stamomkrets saknas."
    };
  }

  const isGiantTree = circumference > GIANT_TREE_MIN_CIRCUMFERENCE_CM;
  const isCoarseHollowTree = circumference > HOLLOW_TREE_MIN_CIRCUMFERENCE_CM && hasDevelopedCavity(hollowStage);

  if (isGiantTree) {
    return {
      passes: true,
      criterion: "jätteträd",
      reason: `Stamomkrets ${circumference} cm motsvarar diameter över ${GIANT_TREE_MIN_DIAMETER_CM} cm.`
    };
  }

  if (isCoarseHollowTree) {
    return {
      passes: true,
      criterion: "grovt hålträd",
      reason: `Stamomkrets ${circumference} cm motsvarar diameter över ${HOLLOW_TREE_MIN_DIAMETER_CM} cm och hålighet är angiven.`
    };
  }

  return {
    passes: false,
    reason: `Trädet uppfyller inte de fältkontrollerbara kriterierna: stamomkrets över cirka ${round(GIANT_TREE_MIN_CIRCUMFERENCE_CM)} cm, eller stamomkrets över cirka ${round(HOLLOW_TREE_MIN_CIRCUMFERENCE_CM)} cm tillsammans med utvecklad hålighet. Ålderskriteriet kontrolleras inte i appen.`
  };
}

export function sstStatusText(draft) {
  const result = evaluateSstCandidate(draft);

  if (result.passes) {
    return `SST-kontroll OK: ${result.criterion}. ${result.reason}`;
  }

  return `SST-kontroll: ${result.reason}`;
}
