import type { Document } from "@/types";

export interface ResearchRecommendation {
  document: Document;
  score: number;
  matchedTopics: string[];
}

const TOPIC_ALIASES: Record<string, string[]> = {
  rag: ["retrieval augmented generation", "retrieval-augmented generation"],
  nlp: ["natural language processing"],
  llms: ["large language model", "large language models"],
  "computer vision": ["computer vision", "vision transformer", "visual recognition"],
  multimodal: ["multimodal", "vision language", "vision-language"],
  "information retrieval": ["information retrieval", "retrieval system", "search"],
};

function getTopicTerms(topic: string): string[] {
  const normalized = topic.trim().toLowerCase();
  return Array.from(new Set([normalized, ...(TOPIC_ALIASES[normalized] ?? [])]));
}

export function recommendResearchDocument(
  documents: Document[],
  topics: string[],
): ResearchRecommendation | null {
  const readyDocuments = documents.filter(
    (document) => document.status === "ready",
  );

  if (readyDocuments.length === 0) {
    return null;
  }

  const normalizedTopics = topics
    .map((topic) => topic.trim())
    .filter(Boolean);

  return readyDocuments
    .map((document) => {
      const title = document.title.toLowerCase();
      const name = document.name.toLowerCase();
      const summary = (document.summary ?? "").toLowerCase();

      let score = 0;
      const matchedTopics: string[] = [];

      for (const topic of normalizedTopics) {
        const terms = getTopicTerms(topic);
        const titleMatch = terms.some((term) => title.includes(term));
        const nameMatch = terms.some((term) => name.includes(term));
        const summaryMatch = terms.some((term) => summary.includes(term));

        if (titleMatch) score += 4;
        else if (nameMatch) score += 3;
        else if (summaryMatch) score += 1;

        if (titleMatch || nameMatch || summaryMatch) {
          matchedTopics.push(topic);
        }
      }

      return {
        document,
        score,
        matchedTopics,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedTopics.length !== a.matchedTopics.length) {
        return b.matchedTopics.length - a.matchedTopics.length;
      }
      return a.document.title.localeCompare(b.document.title);
    })[0] ?? null;
}
