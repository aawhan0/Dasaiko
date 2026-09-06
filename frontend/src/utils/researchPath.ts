export type ResearchPathStage = "discover" | "read" | "question" | "synthesize";

export interface ResearchPathItem {
  id: ResearchPathStage;
  title: string;
  description: string;
}

export const RESEARCH_PATH: ResearchPathItem[] = [
  { id: "discover", title: "Discover", description: "Find papers aligned with your research interests." },
  { id: "read", title: "Read", description: "Open the source and inspect the paper in context." },
  { id: "question", title: "Question", description: "Ask focused questions against the research material." },
  { id: "synthesize", title: "Synthesize", description: "Compare evidence and build understanding from sources." },
];

export function getResearchPathStage(hasPaper: boolean, hasQuestion: boolean, hasAnswer: boolean): ResearchPathStage {
  if (hasAnswer) return "synthesize";
  if (hasQuestion) return "question";
  if (hasPaper) return "read";
  return "discover";
}
