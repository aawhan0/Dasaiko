import api from "./api";

import type {
  ChatRequest,
  ChatResponse,
} from "@/types/api/chat";

interface StreamEvent {
  type:
    | "start"
    | "chunk"
    | "done"
    | "error";

  content?: string;

  data?: ChatResponse;

  message?: string;
}

export async function sendQuery(
  request: ChatRequest,
  onChunk?: (chunk: string) => void
): Promise<ChatResponse> {
  const baseURL =
    api.defaults.baseURL ?? "";

  const streamURL =
    `${baseURL.replace(/\/$/, "")}/chat/stream`;

  const token =
  localStorage.getItem("token");

const response =
  await fetch(
    streamURL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify(
        request
      ),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Chat request failed: ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Streaming is not supported by this response."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  let finalResponse:
    | ChatResponse
    | null = null;

  let streamError:
    | string
    | null = null;

  const processEvent = (
    eventBlock: string
  ) => {
    const dataLine =
      eventBlock
        .split("\n")
        .find(
          (line) =>
            line.startsWith(
              "data:"
            )
        );

    if (!dataLine) {
      return;
    }

    const payload =
      dataLine
        .slice(5)
        .trim();

    if (!payload) {
      return;
    }

    const event =
      JSON.parse(
        payload
      ) as StreamEvent;

    if (
      event.type ===
        "chunk" &&
      event.content
    ) {
      onChunk?.(
        event.content
      );
    }

    if (
      event.type ===
        "done" &&
      event.data
    ) {
      finalResponse =
        event.data;
    }

    if (
      event.type ===
      "error"
    ) {
      streamError =
        event.message ??
        "Chat stream failed.";
    }
  };

  while (true) {
    const {
      value,
      done,
    } =
      await reader.read();

    if (done) {
      break;
    }

    buffer +=
      decoder.decode(
        value,
        {
          stream: true,
        }
      );

    const events =
      buffer.split(
        "\n\n"
      );

    buffer =
      events.pop() ?? "";

    for (
      const eventBlock
      of events
    ) {
      processEvent(
        eventBlock
      );
    }
  }

  buffer +=
    decoder.decode();

  if (buffer.trim()) {
    processEvent(
      buffer
    );
  }

  if (streamError) {
    throw new Error(
      streamError
    );
  }

  if (!finalResponse) {
    throw new Error(
      "Chat stream ended without a final response."
    );
  }

  return finalResponse;
}
