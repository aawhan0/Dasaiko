import api from "./api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response =
    await api.post<LoginResponse>(
      "/auth/login",
      {
        email,
        password,
      },
    );

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response =
    await api.get<AuthUser>("/auth/me");

  return response.data;
}

export function logout(): void {
  localStorage.removeItem("token");

  window.dispatchEvent(
    new CustomEvent("dasaiko:logout"),
  );
}