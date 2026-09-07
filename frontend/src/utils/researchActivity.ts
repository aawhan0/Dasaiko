import {
  recordResearchActivity,
  type ResearchActivityType,
} from "@/services/activity";

const SESSION_PREFIX = "dasaiko.activity.session";
const VISIT_PREFIX = "dasaiko.activity.visited";

function storageKey(paperId: string, eventType: ResearchActivityType) {
  return `${SESSION_PREFIX}.${eventType}.${paperId}`;
}

export function recordResearchActivityOnce(
  paperId: string,
  eventType: ResearchActivityType,
): void {
  if (!paperId) return;

  try {
    const key = storageKey(paperId, eventType);
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage failures must never block research interactions.
  }

  void recordResearchActivity(paperId, eventType).catch((error) => {
    console.warn("Failed to record research activity:", error);
  });
}

export function recordPaperVisit(paperId: string): void {
  if (!paperId) return;

  let revisit = false;
  try {
    revisit = localStorage.getItem(`${VISIT_PREFIX}.${paperId}`) === "1";
    localStorage.setItem(`${VISIT_PREFIX}.${paperId}`, "1");
  } catch {
    // Fall back to a normal open event when browser storage is unavailable.
  }

  recordResearchActivityOnce(
    paperId,
    revisit ? "paper_revisited" : "paper_opened",
  );
}
