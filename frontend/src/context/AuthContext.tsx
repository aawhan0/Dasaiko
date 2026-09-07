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
  type ResearchProfile,
  getResearchProfile,
  updateResearchProfile,
} from "@/services/auth";

import {
  useWorkspaceStore,
} from "@/store/useWorkspaceStore";

const ONBOARDING_STORAGE_PREFIX = "dasaiko.onboarding.v1";
const SELECTED_DOCUMENT_STORAGE_KEY =
  "dasaiko.selectedDocumentByConversation";

function onboardingStorageKey(userId: number) {
  return `${ONBOARDING_STORAGE_PREFIX}.${userId}`;
}

function hasLocalOnboardingCompletion(userId: number | undefined): boolean {
  if (!userId) return false;

  try {
    const raw = localStorage.getItem(onboardingStorageKey(userId));
    if (!raw) return false;
    if (raw === "completed") return true;
    return JSON.parse(raw)?.status === "completed";
  } catch {
    return false;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: ResearchProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  saveResearchProfile: (profile: {
    role: string;
    interests: string[];
    goals: string[];
    research_familiarity: string;
    onboarding_completed: boolean;
  }) => Promise<ResearchProfile>;
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

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    clearWorkspace,
  } = useWorkspaceStore();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ResearchProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem(SELECTED_DOCUMENT_STORAGE_KEY);
    clearWorkspace();
    setUser(null);
    setProfile(null);
  }, [clearWorkspace]);

  const refreshProfile = useCallback(async () => {
    const currentProfile = await getResearchProfile();
    setProfile(currentProfile);
  }, []);

  const saveResearchProfile = useCallback(async (nextProfile: {
    role: string;
    interests: string[];
    goals: string[];
    research_familiarity: string;
    onboarding_completed: boolean;
  }) => {
    const savedProfile = await updateResearchProfile(nextProfile);
    setProfile(savedProfile);
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            onboarding_completed: savedProfile.onboarding_completed,
            onboarding_role: savedProfile.role,
            onboarding_interests: savedProfile.interests,
            onboarding_goals: savedProfile.goals,
            research_familiarity: savedProfile.research_familiarity,
          }
        : currentUser,
    );

    if (savedProfile.onboarding_completed && user) {
      try {
        localStorage.setItem(
          onboardingStorageKey(user.id),
          JSON.stringify({
            status: "completed",
            role: savedProfile.role,
            interests: savedProfile.interests,
            goals: savedProfile.goals,
            researchFamiliarity: savedProfile.research_familiarity,
            completedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Local persistence is a convenience; server state remains authoritative.
      }
    }

    return savedProfile;
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (!mounted) return;

        const locallyCompleted = hasLocalOnboardingCompletion(currentUser.id);
        const restoredUser = locallyCompleted && !currentUser.onboarding_completed
          ? { ...currentUser, onboarding_completed: true }
          : currentUser;

        setUser(restoredUser);

        try {
          const currentProfile = await getResearchProfile();
          if (mounted) {
            setProfile(
              locallyCompleted && !currentProfile.onboarding_completed
                ? { ...currentProfile, onboarding_completed: true }
                : currentProfile,
            );
          }
        } catch {
          if (mounted) setProfile(null);
        }
      } catch {
        if (mounted) clearAuth();
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restoreSession();

    const handleUnauthorized = () => clearAuth();
    const handleLogout = () => clearAuth();

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

  const login = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      const result = await loginRequest(email, password);
      localStorage.setItem("token", result.access_token);
      setUser(result.user);
      const currentProfile = await getResearchProfile();
      setProfile(currentProfile);
    },
    [],
  );

  const verifyEmail = useCallback(
    async (
      email: string,
      code: string,
    ) => {
      const result = await verifyEmailRequest(email, code);
      localStorage.setItem("token", result.access_token);
      setUser(result.user);
      const currentProfile = await getResearchProfile();
      setProfile(currentProfile);
    },
    [],
  );

  const logout = useCallback(() => {
    logoutRequest();
    clearWorkspace();
    localStorage.removeItem(SELECTED_DOCUMENT_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  }, [clearWorkspace]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: user !== null,
      refreshProfile,
      saveResearchProfile,
      login,
      verifyEmail,
      logout,
    }),
    [
      user,
      profile,
      isLoading,
      refreshProfile,
      saveResearchProfile,
      login,
      verifyEmail,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}
