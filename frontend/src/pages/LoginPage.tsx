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
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { DasaikoLogo } from "@/components/brand/DasaikoLogo";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
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
     LOGIN
  ========================================================= */

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

      navigate(destination, {
        replace: true,
      });
    } catch (
      requestError: unknown
    ) {
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
        errorResponse.response?.data
          ?.detail ??
        errorResponse.response?.data
          ?.message ??
        "Unable to sign in. Please check your credentials and try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

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
          BACKGROUND ATMOSPHERE
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
          bg-secondary/[0.045]
          blur-[160px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_35%_45%,rgba(139,92,246,0.08),transparent_35%)]
        "
      />

      {/* =====================================================
          MAIN SPLIT LAYOUT
      ====================================================== */}

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
            lg:justify-between
            lg:px-16
            lg:py-14
            xl:px-24
          "
        >
          {/* Decorative grid */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-30
              [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
              [background-size:72px_72px]
              [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]
            "
          />

          {/* Purple glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[600px]
              w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-primary/[0.045]
              blur-[150px]
            "
          />

          {/* ===============================================
              BRAND
          ================================================ */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              group
              relative
              z-10
              flex
              w-fit
              items-center
            "
            aria-label="Go to Dasaiko home"
          >
            <DasaikoLogo
              size="lg"
              variant="gradient"
              showTagline
            />
          </button>

          {/* ===============================================
              CENTRAL VISUAL
          ================================================ */}

          <div
            className="
              relative
              z-10
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

            {/* =============================================
                ABSTRACT EVIDENCE VISUAL
            ============================================== */}

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
                bg-white/[0.018]
              "
            >
              {/* Header */}

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

              {/* Evidence lines */}

              <div className="space-y-4 px-5 py-5">
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

              {/* Glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[-80px]
                  right-[-40px]
                  h-40
                  w-40
                  rounded-full
                  bg-primary/[0.12]
                  blur-[70px]
                "
              />
            </div>
          </div>

          {/* ===============================================
              BOTTOM SIGNAL
          ================================================ */}

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
            RIGHT LOGIN PANEL
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
            {/* =============================================
                FORM HEADER
            ============================================== */}

            <div className="mb-9">
              <div
                className="
                  mb-5
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[13px]
                  border-[1.5px]
                  border-primary/25
                  bg-primary/[0.09]
                  text-primary
                "
              >
                <LockKeyhole
                  className="
                    h-5
                    w-5
                    stroke-[2.2]
                  "
                />
              </div>

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
                Welcome back.
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
                Sign in to continue your research
                and pick up where you left off.
              </p>
            </div>

            {/* =============================================
                FORM
            ============================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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
                    onChange={(event) =>
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
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
                    ? "Signing in..."
                    : "Sign in"}
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

            {/* =============================================
                SMALL FOOTER
            ============================================== */}

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