import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowRight,
  BookOpen,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } =
    useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        "/workspace",
        { replace: true },
      );
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(
        email.trim(),
        password,
      );

      const destination =
        (
          location.state as
            | { from?: string }
            | null
        )?.from ?? "/workspace";

      navigate(
        destination,
        { replace: true },
      );
    } catch (requestError: unknown) {
      const errorResponse =
        requestError as {
          response?: {
            data?: {
              detail?: string;
              message?: string;
            };
          };
        };

      const message =
        errorResponse.response?.data?.detail ??
        errorResponse.response?.data?.message ??
        "Unable to sign in. Please check your credentials and try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-base text-zinc-300 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mx-auto mb-8 flex items-center gap-2.5 text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow-sm">
            <BookOpen className="h-4 w-4" />
          </span>

          <span className="text-xl font-bold tracking-tight">
            Dasaiko
          </span>
        </button>

        <section className="rounded-2xl border border-white/[0.08] bg-surface/70 p-7 shadow-2xl backdrop-blur-xl">
          <div className="mb-7">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h1 className="text-2xl font-bold text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Sign in to access your research workspace, documents, and conversations.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-zinc-400"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/[0.10] bg-base py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-zinc-400"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/[0.10] bg-base py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in"}

              {!isSubmitting && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600">
            Your research data is isolated to your authenticated account.
          </p>
        </section>
      </div>
    </main>
  );
}
