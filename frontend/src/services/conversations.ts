import api from "./api";

import type {
  Conversation,
} from "@/types";


interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


interface ConversationResponse {
  id: number;
  title: string;
  is_pinned: boolean;
  selected_document_id: number | null;
}


function mapConversation(
  conversation: ConversationResponse,
): Conversation {
  return {
    id: String(conversation.id),
    title: conversation.title,
    isPinned: conversation.is_pinned,
    documentIds: [],
    messageCount: 0,
    lastActivityAt: new Date().toISOString(),
    selectedDocumentId:
      conversation.selected_document_id ?? null,
  };
}


export async function listConversations():
  Promise<Conversation[]> {
  const response =
    await api.get<
      ApiResponse<ConversationResponse[]>
    >("/conversations");

  return response.data.data.map(
    mapConversation
  );
}


export async function createConversation():
  Promise<Conversation> {
  const response =
    await api.post<
      ApiResponse<ConversationResponse>
    >("/conversations", {});

  return mapConversation(
    response.data.data
  );
}


export async function toggleConversationPin(
  conversationId: string,
): Promise<Conversation> {
  const response =
    await api.patch<
      ApiResponse<ConversationResponse>
    >(
      `/conversations/${conversationId}/pin`
    );

  return mapConversation(
    response.data.data
  );
}


export async function renameConversation(
  conversationId: string,
  title: string,
): Promise<Conversation> {
  const response =
    await api.patch<
      ApiResponse<ConversationResponse>
    >(
      `/conversations/${conversationId}/rename`,
      { title }
    );

  return mapConversation(
    response.data.data
  );
}


export async function deleteConversation(
  id: string,
): Promise<void> {
  await api.delete(
    `/conversations/${id}`
  );
}
