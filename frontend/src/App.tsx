import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { WorkspaceProvider } from "@/store/useWorkspaceStore";
import { UploadProvider } from "@/store/useUploadStore";
import { AuthProvider } from "@/context/AuthContext";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:
          1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  });

export function App() {
  return (
    <QueryClientProvider
      client={queryClient}
    >
      <BrowserRouter>
        <WorkspaceProvider>
          <UploadProvider>
            <AuthProvider>
              <Routes>

                {/* Public */}

                <Route
                  path="/"
                  element={
                    <LandingPage />
                  }
                />

                <Route
                  path="/login"
                  element={
                    <LoginPage />
                  }
                />

                <Route
                  path="/verify-email"
                  element={
                    <VerifyEmailPage />
                  }
                />

                {/* Protected */}

                <Route
                  element={
                    <ProtectedRoute />
                  }
                >
                  <Route
                    path="/workspace"
                    element={
                      <WorkspacePage />
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <SettingsPage />
                    }
                  />
                </Route>

                {/* Fallback */}

                <Route
                  path="*"
                  element={
                    <NotFoundPage />
                  }
                />

              </Routes>
            </AuthProvider>
          </UploadProvider>
        </WorkspaceProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;