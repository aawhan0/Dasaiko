export interface MessageResponse {
  id: number;
  role: "user" | "assistant";
  content: string;
}