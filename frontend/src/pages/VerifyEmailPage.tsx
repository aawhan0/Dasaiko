import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Check,
  MailCheck,
  RefreshCw,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import {
  PENDING_VERIFICATION_EMAIL_KEY,
  resendVerification,
} from "@/services/auth";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    verifyEmail,
    isAuthenticated,
  } = useAuth();

  const stateEmail =
    (
      location.state as
        | { email?: string }
        | null
    )?.email ?? "";

  const storedEmail =
    localStorage.getItem(
      PENDING_VERIFICATION_EMAIL_KEY,
    ) ?? "";

  const initialEmail =
    stateEmail || storedEmail;

  const [email, setEmail] =
    useState(initialEmail);

  const [code, setCode] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(0);

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

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setResendCooldown(
          (current) =>
            Math.max(
              0,
              current - 1,
            ),
        );
      }, 1000);

    return () =>
      window.clearInterval(
        timer,
      );
  }, [resendCooldown]);

  const maskedEmail =
    useMemo(() => {
      const [name, domain] =
        email.split("@");

      if (
        !name ||
        !domain
      ) {
        return email;
      }

      if (name.length <= 2) {
        return `${name[0] ?? ""}***@${domain}`;
      }

      return `${name.slice(0, 2)}***@${domain}`;
    }, [email]);

  function handleCodeChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setCode(nextValue);
    setError("");
  }

  async function handleVerify(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "We need your email address to verify your account.",
      );
      return;
    }

    if (code.length !== 6) {
      setError(
        "Enter the 6-digit verification code.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyEmail(
        email.trim().toLowerCase(),
        code,
      );

      localStorage.removeItem(
        PENDING_VERIFICATION_EMAIL_KEY,
      );

      setSuccess(
        "Email verified. Taking you to your workspace...",
      );

      navigate(
        "/workspace",
        {
          replace: true,
        },
      );
    } catch (
      requestError: any
    ) {
      const detail =
        requestError?.response?.data
          ?.detail;

      if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to verify your email. Please check the code and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (
      !email.trim() ||
      resendCooldown > 0 ||
      isResending
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const result =
        await resendVerification(
          email.trim().toLowerCase(),
        );

      localStorage.setItem(
        PENDING_VERIFICATION_EMAIL_KEY,
        result.email,
      );

      setEmail(result.email);
      setCode("");
      setResendCooldown(60);

      setSuccess(
        "A new verification code has been sent to your email.",
      );
    } catch (
      requestError: any
    ) {
      const detail =
        requestError?.response?.data
          ?.detail;

      if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to resend the verification code. Please try again later.",
        );
      }
    } finally {
      setIsResending(false);
    }
  }

  function handleChangeEmail() {
    localStorage.removeItem(
      PENDING_VERIFICATION_EMAIL_KEY,
    );

    navigate(
      "/login",
      {
        replace: true,
        state: {
          mode: "signup",
        },
      },
    );
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
      {/* Background atmosphere */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[20%]
          h-[520px]
          w-[520px]
          -translate-x-1/2
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
          inset-0
          bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.09),transparent_38%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-6
          py-12
        "
      >
        <div
          className="
            w-full
            max-w-[480px]
          "
        >
          {/* Brand */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              mx-auto
              mb-12
              flex
              w-fit
              transition-opacity
              hover:opacity-80
            "
          >
            <img
              src="/assets/brand/dasaiko-wordmark-transparent-bg.png"
              alt="Dasaiko"
              className="
                h-auto
                w-[145px]
              "
            />
          </button>

          {/* Card */}

          <div
            className="
              rounded-[24px]
              border
              border-white/[0.08]
              bg-[#08080b]/90
              p-7
              shadow-[0_30px_100px_rgba(0,0,0,0.35)]
              backdrop-blur-xl
              sm:p-9
            "
          >
            <div
              className="
                mb-7
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-primary/20
                bg-primary/[0.08]
              "
            >
              <MailCheck
                className="
                  h-6
                  w-6
                  text-primary
                "
              />
            </div>

            <div className="mb-8">
              <p
                className="
                  mb-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-primary
                "
              >
                Email verification
              </p>

              <h1
                className="
                  text-[38px]
                  font-extrabold
                  leading-none
                  tracking-[-0.06em]
                  text-white
                  sm:text-[44px]
                "
              >
                Check your inbox.
              </h1>

              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                  leading-6
                  text-zinc-500
                "
              >
                We sent a 6-digit verification
                code to{" "}
                <span className="text-zinc-300">
                  {maskedEmail}
                </span>
                .
              </p>
            </div>

            <form
              onSubmit={handleVerify}
              className="space-y-5"
            >
              <div className="space-y-2.5">
                <label
                  htmlFor="verification-code"
                  className="
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  Verification code
                </label>

                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={
                    handleCodeChange
                  }
                  autoFocus
                  placeholder="000000"
                  className="
                    h-[72px]
                    w-full
                    rounded-[16px]
                    border-[1.5px]
                    border-white/[0.10]
                    bg-[#050507]
                    px-5
                    text-center
                    text-[28px]
                    font-bold
                    tracking-[0.45em]
                    text-white
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-zinc-800
                    focus:border-primary/60
                    focus:ring-4
                    focus:ring-primary/[0.07]
                  "
                />
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
                disabled={
                  isSubmitting ||
                  code.length !== 6
                }
                className="
                  group
                  relative
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
                  text-black
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  hover:bg-zinc-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40
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
                    ? "Verifying..."
                    : "Verify email"}
                </span>

                {!isSubmitting && (
                  <ArrowRight
                    className="
                      relative
                      h-4
                      w-4
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
                mt-7
                flex
                flex-col
                items-center
                gap-4
                border-t
                border-white/[0.06]
                pt-6
              "
            >
              <button
                type="button"
                onClick={handleResend}
                disabled={
                  isResending ||
                  resendCooldown > 0
                }
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-zinc-400
                  transition-colors
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:text-zinc-700
                "
              >
                <RefreshCw
                  className={`
                    h-3.5
                    w-3.5
                    ${
                      isResending
                        ? "animate-spin"
                        : ""
                    }
                  `}
                />

                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't receive the code? Resend"}
              </button>

              <button
                type="button"
                onClick={
                  handleChangeEmail
                }
                className="
                  text-[10px]
                  font-bold
                  text-zinc-600
                  transition-colors
                  hover:text-white
                "
              >
                Use a different email
              </button>
            </div>
          </div>

          <div
            className="
              mt-7
              flex
              items-center
              justify-center
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

            Your verification code expires
            in 10 minutes
          </div>
        </div>
      </div>
    </main>
  );
}