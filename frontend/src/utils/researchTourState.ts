import { TOUR_STORAGE_KEYS } from "@/components/tour/tourConfig";

export function markResearchTourCompleted(): void {
  try {
    localStorage.setItem(TOUR_STORAGE_KEYS.completed, "true");
    localStorage.removeItem(TOUR_STORAGE_KEYS.active);
    localStorage.removeItem(TOUR_STORAGE_KEYS.prompt);
    localStorage.removeItem(TOUR_STORAGE_KEYS.questionMessage);
    localStorage.removeItem(TOUR_STORAGE_KEYS.questionMessage);
  } catch {
    // Completion is best-effort; never block the workspace.
  }
}

export function isResearchTourCompleted(): boolean {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEYS.completed) === "true";
  } catch {
    return false;
  }
}

export function markResearchTourActive(step = "preferences"): void {
  try {
    localStorage.setItem(TOUR_STORAGE_KEYS.active, step);
  } catch {
    // Ignore storage failures.
  }
}

export function clearResearchTourState(): void {
  try {
    localStorage.removeItem(TOUR_STORAGE_KEYS.active);
    localStorage.removeItem(TOUR_STORAGE_KEYS.prompt);
  } catch {
    // Ignore storage failures.
  }
}
