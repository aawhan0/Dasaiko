import api from "./api";

import {
  ChatRequest,
  ChatResponse,
} from "@/types/api/chat";

import type { APIResponse } from "@/types/api/common";
export async function sendQuery(
  request: ChatRequest
): Promise<ChatResponse> {
  const response = await api.post<APIResponse<ChatResponse>>(
    "/chat",
    request
  );

  return response.data.data;
}