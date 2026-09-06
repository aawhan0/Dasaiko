import api from "./api";
export interface ResearchPathItem { paper_id: string; title: string; difficulty: string; stage: string; rationale: string; prerequisites: string[]; }
export interface ResearchPathResponse { topic: string; items: ResearchPathItem[]; }
export async function getResearchPath(topic: string): Promise<ResearchPathResponse> { const response = await api.get<ResearchPathResponse>("/research/path", { params: { topic } }); return response.data; }
