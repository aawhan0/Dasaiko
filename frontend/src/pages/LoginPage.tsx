import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import {
  PENDING_VERIFICATION_EMAIL_KEY,
  register as registerRequest,
} from "@/services/auth";

import GradientWaves from "@/components/GradientWaves";

type AuthMode = "signin" | "signup";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [mode, setMode] =
    useState<AuthMode>("signin");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/workspace", {
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    navigate,
  ]);

  const handleModeChange = (
    nextMode: AuthMode,
  ) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const normalizedEmail =
      email.trim().toLowerCase();

    try {
      /* ===============================================
         SIGN IN
      ================================================ */

      if (mode === "signin") {
        try {
          await login(
            normalizedEmail,
            password,
          );

          const destination =
            (
              location.state as
                | { from?: string }
                | null
            )?.from ?? "/workspace";

          navigate(destination, {
            replace: true,
          });

          return;
        } catch (requestError: any) {
          /*
           * Backend returns 403 when the credentials
           * are valid but the email is not verified.
           *
           * Send the user directly to verification.
           */
          if (
            requestError?.response?.status ===
              403 &&
            requestError?.response?.data?.detail
              ?.toLowerCase()
              .includes("verify")
          ) {
            localStorage.setItem(
              PENDING_VERIFICATION_EMAIL_KEY,
              normalizedEmail,
            );

            navigate(
              "/verify-email",
              {
                replace: true,
                state: {
                  email: normalizedEmail,
                },
              },
            );

            return;
          }

          throw requestError;
        }
      }

      /* ===============================================
         SIGN UP
      ================================================ */

      const result =
        await registerRequest(
          username.trim(),
          normalizedEmail,
          password,
        );

      localStorage.setItem(
        PENDING_VERIFICATION_EMAIL_KEY,
        result.email,
      );

      navigate(
        "/verify-email",
        {
          replace: true,
          state: {
            email: result.email,
          },
        },
      );
    } catch (
      requestError: any
    ) {
      const detail =
        requestError?.response?.data
          ?.detail;

      if (
        Array.isArray(detail)
      ) {
        setError(
          detail
            .map(
              (item: any) =>
                item?.msg ??
                "Invalid input.",
            )
            .join(" "),
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else if (
        requestError instanceof Error
      ) {
        setError(
          requestError.message,
        );
      } else {
        setError(
          mode === "signin"
            ? "Unable to sign in. Please check your credentials and try again."
            : "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignIn =
    mode === "signin";

  const heading = isSignIn
    ? "Welcome back."
    : "Create your account.";

  const description = isSignIn
    ? "Sign in to continue your research and pick up where you left off."
    : "Create your account and start building your evidence-backed research workspace.";

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050507]
        text-white
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          left-[18%]
          top-[30%]
          h-[520px]
          w-[520px]
          rounded-full
          bg-primary/[0.07]
          blur-[180px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[5%]
          top-[20%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-primary/[0.035]
          blur-[160px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_35%_45%,rgba(139,92,246,0.08),transparent_35%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          relative
          z-10
          grid
          min-h-screen
          lg:grid-cols-[1.08fr_0.92fr]
        "
      >
        {/* ===================================================
            LEFT VISUAL PANEL
        ==================================================== */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            border-r
            border-white/[0.07]
            lg:flex
            lg:flex-col
            lg:px-16
            lg:py-12
            xl:px-24
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              overflow-hidden
            "
            aria-hidden="true"
          >
            <GradientWaves
              horizonColor="#120020"
              waveColor="#6D28D9"
              crestColor="#C084FC"
              speed={0.16}
              amplitude={3.2}
              waveScale={0.48}
              waveRatio={0.82}
              swell={34}
              turbulence={12}
              tilt={1.08}
              zoom={1}
              height={5.8}
              fogDepth={14}
              detail="high"
              brightness={1.15}
              opacity={0.78}
              mouseInteraction={false}
              parallaxStrength={0}
              grain={true}
              grainIntensity={0.018}
              className="absolute inset-0"
            />

            <div
              className="
                absolute
                inset-0
                bg-[linear-gradient(180deg,rgba(5,5,7,0.30)_0%,rgba(5,5,7,0.12)_42%,rgba(5,5,7,0.48)_100%)]
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(ellipse_at_center,transparent_5%,rgba(5,5,7,0.18)_58%,rgba(5,5,7,0.62)_100%)]
              "
            />
          </div>

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[1]
              opacity-20
              [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
              [background-size:72px_72px]
              [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              z-[1]
              h-[600px]
              w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-primary/[0.045]
              blur-[150px]
            "
            aria-hidden="true"
          />

          <div
            className="
              relative
              z-10
              flex
              w-full
              items-center
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              aria-label="Dasaiko home"
              className="
                flex
                w-fit
                items-center
                transition-opacity
                duration-300
                hover:opacity-80
              "
            >
              <img
                src="/assets/brand/dasaiko-wordmark-transparent-bg.png"
                alt="Dasaiko"
                className="
                  h-auto
                  w-[145px]
                  object-contain
                  object-left
                "
              />
            </button>
          </div>

          <div
            className="
              relative
              z-10
              flex
              flex-1
              items-center
            "
          >
            <div
              className="
                w-full
                max-w-[650px]
              "
            >
              <div
                className="
                  mb-7
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-primary
                    shadow-[0_0_14px_rgba(139,92,246,0.8)]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.24em]
                    text-zinc-500
                  "
                >
                  Evidence-first research
                </span>
              </div>

              <h2
                className="
                  text-[54px]
                  font-extrabold
                  leading-[0.95]
                  tracking-[-0.065em]
                  text-white
                  xl:text-[68px]
                "
              >
                Your research,
                <br />

                <span className="text-zinc-600">
                  with receipts.
                </span>
              </h2>

              <p
                className="
                  mt-7
                  max-w-[500px]
                  text-[15px]
                  font-medium
                  leading-7
                  text-zinc-500
                "
              >
                Bring papers, documents, questions,
                and evidence together in one workspace
                built for serious research.
              </p>

              <div
                className="
                  relative
                  mt-12
                  h-[180px]
                  max-w-[520px]
                  overflow-hidden
                  rounded-[20px]
                  border-[1.5px]
                  border-white/[0.09]
                  bg-black/[0.28]
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    px-5
                    py-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2.5
                    "
                  >
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-primary/20
                        bg-primary/[0.08]
                      "
                    >
                      <Sparkles
                        className="
                          h-3.5
                          w-3.5
                          text-primary
                        "
                      />
                    </div>

                    <span
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-zinc-500
                      "
                    >
                      Research context
                    </span>
                  </div>

                  <span
                    className="
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-400/[0.06]
                      px-2.5
                      py-1
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-emerald-400/80
                    "
                  >
                    Verified
                  </span>
                </div>

                <div
                  className="
                    space-y-4
                    px-5
                    py-5
                  "
                >
                  <div
                    className="
                      h-2
                      w-[58%]
                      rounded-full
                      bg-white/[0.13]
                    "
                  />

                  <div
                    className="
                      h-1.5
                      w-[82%]
                      rounded-full
                      bg-white/[0.055]
                    "
                  />

                  <div
                    className="
                      h-1.5
                      w-[70%]
                      rounded-full
                      bg-white/[0.055]
                    "
                  />

                  <div
                    className="
                      mt-5
                      h-[30px]
                      w-[88%]
                      rounded-lg
                      border-l-2
                      border-primary
                      bg-primary/[0.08]
                    "
                  />
                </div>

                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-[-80px]
                    right-[-40px]
                    h-40
                    w-40
                    rounded-full
                    bg-primary/[0.15]
                    blur-[70px]
                  "
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <div
            className="
              relative
              z-10
              flex
              items-center
              gap-4
              text-[9px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-zinc-700
            "
          >
            <span
              className="
                h-px
                w-10
                bg-white/[0.08]
              "
            />

            Documents

            <span className="text-zinc-800">
              /
            </span>

            Retrieval

            <span className="text-zinc-800">
              /
            </span>

            Evidence
          </div>
        </section>

        {/* ===================================================
            RIGHT AUTH PANEL
        ==================================================== */}

        <section
          className="
            flex
            min-h-screen
            items-center
            justify-center
            px-6
            py-12
            sm:px-10
            lg:px-16
            xl:px-24
          "
        >
          <div
            className="
              w-full
              max-w-[460px]
            "
          >
            <div className="mb-7">
              <h1
                className="
                  text-[42px]
                  font-extrabold
                  leading-none
                  tracking-[-0.06em]
                  text-white
                  sm:text-[48px]
                "
              >
                {heading}
              </h1>

              <p
                className="
                  mt-4
                  max-w-[390px]
                  text-sm
                  font-medium
                  leading-6
                  text-zinc-500
                "
              >
                {description}
              </p>
            </div>

            <div
              className="
                mb-7
                grid
                grid-cols-2
                rounded-[13px]
                border
                border-white/[0.08]
                bg-white/[0.02]
                p-1
              "
            >
              <button
                type="button"
                onClick={() =>
                  handleModeChange(
                    "signin",
                  )
                }
                className={`
                  rounded-[10px]
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  transition-all
                  duration-300
                  ${
                    isSignIn
                      ? `
                        bg-white
                        text-black
                        shadow-[0_5px_20px_rgba(255,255,255,0.06)]
                      `
                      : `
                        text-zinc-600
                        hover:text-zinc-300
                      `
                  }
                `}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() =>
                  handleModeChange(
                    "signup",
                  )
                }
                className={`
                  rounded-[10px]
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  transition-all
                  duration-300
                  ${
                    !isSignIn
                      ? `
                        bg-white
                        text-black
                        shadow-[0_5px_20px_rgba(255,255,255,0.06)]
                      `
                      : `
                        text-zinc-600
                        hover:text-zinc-300
                      `
                  }
                `}
              >
                Sign up
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* USERNAME */}

              {!isSignIn && (
                <div className="space-y-2.5">
                  <label
                    htmlFor="username"
                    className="
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-zinc-500
                    "
                  >
                    Username
                  </label>

                  <div className="relative">
                    <User
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        h-[17px]
                        w-[17px]
                        -translate-y-1/2
                        text-zinc-700
                      "
                    />

                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      required={!isSignIn}
                      minLength={3}
                      maxLength={50}
                      value={username}
                      onChange={(
                        event,
                      ) =>
                        setUsername(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Choose a username"
                      className="
                        h-[58px]
                        w-full
                        rounded-[15px]
                        border-[1.5px]
                        border-white/[0.10]
                        bg-[#08080b]
                        pl-12
                        pr-4
                        text-sm
                        font-medium
                        text-white
                        outline-none
                        transition-all
                        duration-300
                        placeholder:text-zinc-700
                        hover:border-white/[0.17]
                        focus:border-primary/60
                        focus:ring-4
                        focus:ring-primary/[0.07]
                      "
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}

              <div className="space-y-2.5">
                <label
                  htmlFor="email"
                  className="
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-[17px]
                      w-[17px]
                      -translate-y-1/2
                      text-zinc-700
                    "
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    placeholder="you@example.com"
                    className="
                      h-[58px]
                      w-full
                      rounded-[15px]
                      border-[1.5px]
                      border-white/[0.10]
                      bg-[#08080b]
                      pl-12
                      pr-4
                      text-sm
                      font-medium
                      text-white
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-zinc-700
                      hover:border-white/[0.17]
                      focus:border-primary/60
                      focus:ring-4
                      focus:ring-primary/[0.07]
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="space-y-2.5">
                <label
                  htmlFor="password"
                  className="
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-[17px]
                      w-[17px]
                      -translate-y-1/2
                      text-zinc-700
                    "
                  />

                  <input
                    id="password"
                    type="password"
                    autoComplete={
                      isSignIn
                        ? "current-password"
                        : "new-password"
                    }
                    required
                    value={password}
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    placeholder={
                      isSignIn
                        ? "Enter your password"
                        : "Create a password"
                    }
                    className="
                      h-[58px]
                      w-full
                      rounded-[15px]
                      border-[1.5px]
                      border-white/[0.10]
                      bg-[#08080b]
                      pl-12
                      pr-4
                      text-sm
                      font-medium
                      text-white
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-zinc-700
                      hover:border-white/[0.17]
                      focus:border-primary/60
                      focus:ring-4
                      focus:ring-primary/[0.07]
                    "
                  />
                </div>
              </div>

              {error && (
                <div
                  className="
                    rounded-[14px]
                    border-[1.5px]
                    border-red-500/25
                    bg-red-500/[0.07]
                    px-4
                    py-3.5
                    text-xs
                    font-medium
                    leading-5
                    text-red-300
                  "
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="
                    rounded-[14px]
                    border-[1.5px]
                    border-emerald-500/20
                    bg-emerald-500/[0.06]
                    px-4
                    py-3.5
                    text-xs
                    font-medium
                    leading-5
                    text-emerald-300
                  "
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  group
                  relative
                  mt-2
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-center
                  gap-2.5
                  overflow-hidden
                  rounded-[15px]
                  bg-white
                  px-5
                  text-sm
                  font-extrabold
                  tracking-[-0.015em]
                  text-black
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  hover:bg-zinc-100
                  hover:shadow-[0_15px_50px_rgba(139,92,246,0.16)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:scale-100
                "
              >
                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-primary/[0.10]
                    to-transparent
                    transition-transform
                    duration-700
                    group-hover:translate-x-full
                  "
                />

                <span className="relative">
                  {isSubmitting
                    ? isSignIn
                      ? "Signing in..."
                      : "Creating account..."
                    : isSignIn
                      ? "Sign in"
                      : "Create account"}
                </span>

                {!isSubmitting && (
                  <ArrowRight
                    className="
                      relative
                      h-4
                      w-4
                      stroke-[2.4]
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                )}
              </button>
            </form>

            <div
              className="
                mt-8
                flex
                items-center
                justify-between
                border-t
                border-white/[0.06]
                pt-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-medium
                  text-zinc-700
                "
              >
                <Check
                  className="
                    h-3.5
                    w-3.5
                    text-emerald-500/70
                  "
                />

                Private research workspace
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="
                  text-[10px]
                  font-bold
                  text-zinc-600
                  transition-colors
                  hover:text-white
                "
              >
                Back home
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}