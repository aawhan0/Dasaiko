import api from "./api";

export interface StarterPaperRecommendation {
  paper_id: string;
  title: string;
  authors: string;
  year: number;
  topics: string[];
  difficulty: "Foundational" | "Accessible" | "Intermediate";
  score: number;
  reason: string;
  matched_interests: string[];
  matched_goals: string[];
  starter_question: string;
  tags: string[];
}

export async function getStarterRecommendations(): Promise<StarterPaperRecommendation[]> {
  const response = await api.get<{
    recommendations: StarterPaperRecommendation[];
  }>("/recommendations/starter");

  return response.data.recommendations;
}
