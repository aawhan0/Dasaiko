import api from "./api";

import type {
  ChatRequest,
  ChatResponse,
} from "@/types/api/chat";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function sendQuery(
  request: ChatRequest
): Promise<ChatResponse> {
  const response =
    await api.post<ApiResponse<ChatResponse>>(
      "/chat",
      request
    );

  return response.data.data;
}