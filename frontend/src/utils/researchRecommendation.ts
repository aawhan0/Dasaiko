import type { Document } from "@/types";

export interface ResearchRecommendation {
  document: Document;
  score: number;
  matchedTopics: string[];
}

export function recommendResearchDocument(
  documents: Document[],
  topics: string[],
): ResearchRecommendation | null {
  const readyDocuments = documents.filter((document) => document.status === "ready");

  if (readyDocuments.length === 0) {
    return null;
  }

  const normalizedTopics = topics
    .map((topic) => topic.trim().toLowerCase())
    .filter(Boolean);

  return readyDocuments
    .map((document) => {
      const haystack = [document.title, document.name, document.summary ?? ""]
        .join(" ")
        .toLowerCase();

      const matchedTopics = normalizedTopics.filter((topic) => haystack.includes(topic));

      return {
        document,
        score: matchedTopics.length,
        matchedTopics,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.document.title.localeCompare(b.document.title);
    })[0] ?? null;
}
