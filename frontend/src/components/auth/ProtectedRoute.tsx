import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
