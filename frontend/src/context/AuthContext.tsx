import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  verifyEmail as verifyEmailRequest,
  type AuthUser,
} from "@/services/auth";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  verifyEmail: (
    email: string,
    code: string,
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

const SELECTED_DOCUMENT_STORAGE_KEY =
  "dasaiko.selectedDocumentByConversation";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    clearWorkspace,
  } = useWorkspaceStore();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const clearAuth =
    useCallback(() => {
      localStorage.removeItem(
        "token",
      );

      localStorage.removeItem(
        SELECTED_DOCUMENT_STORAGE_KEY,
      );

      clearWorkspace();

      setUser(null);
    }, [clearWorkspace]);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token =
        localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setIsLoading(false);
        }

        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        clearAuth();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    const handleUnauthorized =
      () => {
        clearAuth();
      };

    const handleLogout =
      () => {
        clearAuth();
      };

    window.addEventListener(
      "dasaiko:unauthorized",
      handleUnauthorized,
    );

    window.addEventListener(
      "dasaiko:logout",
      handleLogout,
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "dasaiko:unauthorized",
        handleUnauthorized,
      );

      window.removeEventListener(
        "dasaiko:logout",
        handleLogout,
      );
    };
  }, [clearAuth]);

  const login =
    useCallback(
      async (
        email: string,
        password: string,
      ) => {
        const result =
          await loginRequest(
            email,
            password,
          );

        localStorage.setItem(
          "token",
          result.access_token,
        );

        setUser(result.user);
      },
      [],
    );

  const verifyEmail =
    useCallback(
      async (
        email: string,
        code: string,
      ) => {
        const result =
          await verifyEmailRequest(
            email,
            code,
          );

        localStorage.setItem(
          "token",
          result.access_token,
        );

        setUser(result.user);
      },
      [],
    );

  const logout =
    useCallback(() => {
      logoutRequest();

      clearWorkspace();

      localStorage.removeItem(
        SELECTED_DOCUMENT_STORAGE_KEY,
      );

      setUser(null);
    }, [clearWorkspace]);

  const value =
    useMemo(
      () => ({
        user,
        isLoading,
        isAuthenticated:
          user !== null,
        login,
        verifyEmail,
        logout,
      }),
      [
        user,
        isLoading,
        login,
        verifyEmail,
        logout,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}