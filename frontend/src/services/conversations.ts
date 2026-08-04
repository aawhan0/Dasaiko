import api from "./api";

import type { Conversation } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ConversationResponse {
  id: number;
  title: string;
  is_pinned: boolean;
}

export async function listConversations(): Promise<Conversation[]> {
  const response =
    await api.get<ApiResponse<ConversationResponse[]>>(
      "/conversations"
    );

  return response.data.data.map((conversation) => ({
    id: String(conversation.id),

    title: conversation.title,

    isPinned: conversation.is_pinned,

    documentIds: [],

    messageCount: 0,

    lastActivityAt: new Date().toISOString(),
  }));
}

export async function createConversation(): Promise<Conversation> {
  const response =
    await api.post<ApiResponse<ConversationResponse>>(
      "/conversations",
      {}
    );

  const conversation = response.data.data;

  return {
    id: String(conversation.id),

    title: conversation.title,

    isPinned: conversation.is_pinned,

    documentIds: [],

    messageCount: 0,

    lastActivityAt: new Date().toISOString(),
  };
}

export async function toggleConversationPin(
  conversationId: string
): Promise<Conversation> {
  const response =
    await api.patch<ApiResponse<ConversationResponse>>(
      `/conversations/${conversationId}/pin`
    );

  const conversation = response.data.data;

  return {
    id: String(conversation.id),

    title: conversation.title,

    isPinned: conversation.is_pinned,

    documentIds: [],

    messageCount: 0,

    lastActivityAt: new Date().toISOString(),
  };
}