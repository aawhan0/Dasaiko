import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
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
  loginWithGoogle,
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

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================================
     REDIRECT IF ALREADY AUTHENTICATED
  ========================================================= */

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

  /* =========================================================
     SWITCH AUTH MODE
  ========================================================= */

  const handleModeChange = (
    nextMode: AuthMode,
  ) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const handleGoogleLogin = () => {
    setError("");
    setSuccess("");

    loginWithGoogle();
  };

  /* =========================================================
     AUTH SUBMIT
  ========================================================= */

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

  /* =========================================================
     CONTENT
  ========================================================= */

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
      {/* =====================================================
          GLOBAL BACKGROUND ATMOSPHERE
      ====================================================== */}

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

          {/* BRAND */}

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

          {/* LEFT CONTENT */}

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

              {/* RESEARCH CONTEXT CARD */}

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

          {/* BOTTOM LABEL */}

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
            {/* HEADING */}

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

            {/* AUTH MODE */}

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

            {/* GOOGLE */}

            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="
                  group
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-[15px]
                  border-[1.5px]
                  border-white/[0.10]
                  bg-white/[0.025]
                  text-sm
                  font-bold
                  text-zinc-200
                  transition-all
                  duration-300
                  hover:border-white/[0.18]
                  hover:bg-white/[0.045]
                  hover:text-white
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="
                    h-5
                    w-5
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.67c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.67Z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.76A5.86 5.86 0 0 1 6.23 12c0-.61.11-1.2.31-1.76V7.71H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.29l3.24-2.53Z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.21c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.33 12 2.33a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
                  />
                </svg>

                <span>
                  Continue with Google
                </span>
              </button>
            </div>

            {/* DIVIDER */}

            <div
              className="
                mb-6
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  h-px
                  flex-1
                  bg-white/[0.07]
                "
              />

              <span
                className="
                  whitespace-nowrap
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-zinc-700
                "
              >
                or continue with email
              </span>

              <div
                className="
                  h-px
                  flex-1
                  bg-white/[0.07]
                "
              />
            </div>

            {/* FORM */}

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
                          event.target.value,
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
                        event.target.value,
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
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
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

                  {isSignIn && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/forgot-password",
                        )
                      }
                      className="
                        text-[11px]
                        font-semibold
                        text-primary
                        transition-colors
                        hover:text-primary/80
                      "
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
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
                        event.target.value,
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
                      pr-12
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

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Release to hide password"
                        : "Hold to reveal password"
                    }
                    onPointerDown={(
                      event,
                    ) => {
                      event.preventDefault();
                      setShowPassword(true);
                    }}
                    onPointerUp={() =>
                      setShowPassword(false)
                    }
                    onPointerCancel={() =>
                      setShowPassword(false)
                    }
                    onPointerLeave={() =>
                      setShowPassword(false)
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-9
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-zinc-600
                      transition-all
                      duration-200
                      hover:bg-white/[0.04]
                      hover:text-zinc-300
                      focus:outline-none
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  >
                    {showPassword ? (
                      <EyeOff
                        className="
                          h-4
                          w-4
                        "
                      />
                    ) : (
                      <Eye
                        className="
                          h-4
                          w-4
                        "
                      />
                    )}
                  </button>
                </div>

                <p
                  className="
                    text-[10px]
                    font-medium
                    text-zinc-700
                  "
                >
                  Hold the eye icon to reveal your password.
                </p>
              </div>

              {/* ERROR */}

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

              {/* SUCCESS */}

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

              {/* SUBMIT */}

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

            {/* FOOTER */}

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