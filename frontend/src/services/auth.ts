import api from "./api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  email_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegistrationResponse {
  message: string;
  email: string;
  email_verified: boolean;
}

export interface VerificationResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface ResendVerificationResponse {
  message: string;
  email: string;
  email_verified: boolean;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

export const PENDING_VERIFICATION_EMAIL_KEY =
  "dasaiko.pendingVerificationEmail";

export const PASSWORD_RESET_EMAIL_KEY =
  "dasaiko.passwordResetEmail";

/**
 * Start Google OAuth authentication.
 *
 * The browser is redirected to the FastAPI backend,
 * which then redirects the user to Google.
 */
export function loginWithGoogle(): void {
  window.location.href =
    "http://127.0.0.1:8000/auth/google";
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<RegistrationResponse> {
  const response =
    await api.post<RegistrationResponse>(
      "/auth/register",
      {
        username,
        email,
        password,
      },
    );

  return response.data;
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

export async function verifyEmail(
  email: string,
  code: string,
): Promise<VerificationResponse> {
  const response =
    await api.post<VerificationResponse>(
      "/auth/verify-email",
      {
        email,
        code,
      },
    );

  return response.data;
}

export async function resendVerification(
  email: string,
): Promise<ResendVerificationResponse> {
  const response =
    await api.post<ResendVerificationResponse>(
      "/auth/resend-verification",
      {
        email,
      },
    );

  return response.data;
}

export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResponse> {
  const response =
    await api.post<PasswordResetResponse>(
      "/auth/forgot-password",
      {
        email,
      },
    );

  return response.data;
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<PasswordResetConfirmResponse> {
  const response =
    await api.post<PasswordResetConfirmResponse>(
      "/auth/reset-password",
      {
        email,
        code,
        new_password: newPassword,
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