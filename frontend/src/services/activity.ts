import api from "./api";

export type ResearchActivityType =
  | "paper_opened"
  | "paper_completed"
  | "paper_saved"
  | "paper_skipped"
  | "paper_revisited";

export async function recordResearchActivity(
  paperId: string,
  eventType: ResearchActivityType,
): Promise<void> {
  await api.post("/activity", {
    paper_id: paperId,
    event_type: eventType,
  });
}
