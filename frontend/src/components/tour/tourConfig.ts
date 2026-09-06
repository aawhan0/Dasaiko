export const RESEARCH_TOUR_STEPS = [
  "preferences",
  "paper",
  "question",
  "viewer",
  "inference",
  "evidence",
  "complete",
] as const;

export type ResearchTourStep = (typeof RESEARCH_TOUR_STEPS)[number];

export const RESEARCH_TOUR_TOTAL = RESEARCH_TOUR_STEPS.length;

export const RESEARCH_TOPICS = [
  "RAG",
  "NLP",
  "Computer Vision",
  "LLMs",
  "Information Retrieval",
  "Multimodal",
] as const;

export const TOUR_STORAGE_KEYS = {
  prompt: "dasaiko.tourPrompt",
  completed: "dasaiko.researchTour.completed",
  active: "dasaiko.researchTour.active",
} as const;
