export interface ResearchEvidenceSummary {
  count: number;
  label: string;
  description: string;
}

export function summarizeResearchEvidence(count: number): ResearchEvidenceSummary {
  const safeCount = Math.max(0, count);

  if (safeCount === 0) {
    return {
      count: 0,
      label: "No evidence yet",
      description: "Run a question against a research source to see the supporting evidence.",
    };
  }

  return {
    count: safeCount,
    label: `${safeCount} evidence source${safeCount === 1 ? "" : "s"}`,
    description: "Trace the answer back to the retrieved parts of the paper.",
  };
}
