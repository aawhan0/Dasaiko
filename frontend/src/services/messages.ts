import api from "./api";

import type { APIResponse } from "@/types/api/common";
import type { MessageResponse } from "@/types/api/message";
import type { ChatMessage } from "@/types";

export async function listMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const response =
    await api.get<APIResponse<MessageResponse[]>>(
      `/messages/${conversationId}`
    );

  return response.data.data.map((message) => ({
    id: String(message.id),
    role: message.role as ChatMessage["role"],
    content: message.content,
    timestamp: new Date().toISOString(),
  }));
}
