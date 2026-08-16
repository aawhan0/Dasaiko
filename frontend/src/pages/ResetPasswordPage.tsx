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
  KeyRound,
  RefreshCw,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  PASSWORD_RESET_EMAIL_KEY,
  requestPasswordReset,
  resetPassword,
} from "@/services/auth";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --------------------------------------------------
  // Recover email from all supported sources.
  //
  // Priority:
  // 1. Router state
  // 2. Email query parameter from email CTA
  // 3. Previously stored email
  // --------------------------------------------------

  const stateEmail =
    (
      location.state as
        | { email?: string }
        | null
    )?.email ?? "";

  const searchParams =
    new URLSearchParams(
      location.search,
    );

  const queryEmail =
    searchParams.get("email") ?? "";

  const storedEmail =
    localStorage.getItem(
      PASSWORD_RESET_EMAIL_KEY,
    ) ?? "";

  const initialEmail =
    stateEmail ||
    queryEmail ||
    storedEmail;

  const [email, setEmail] =
    useState(initialEmail);

  const [code, setCode] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

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
  ] = useState(60);

  // --------------------------------------------------
  // Persist the recovered email so refreshes still
  // work after arriving through the email CTA.
  // --------------------------------------------------

  useEffect(() => {
    if (!initialEmail) {
      navigate(
        "/forgot-password",
        {
          replace: true,
        },
      );

      return;
    }

    const normalizedEmail =
      initialEmail
        .trim()
        .toLowerCase();

    setEmail(normalizedEmail);

    localStorage.setItem(
      PASSWORD_RESET_EMAIL_KEY,
      normalizedEmail,
    );
  }, [
    initialEmail,
    navigate,
  ]);

  // --------------------------------------------------
  // Resend cooldown
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Mask email for display
  // --------------------------------------------------

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

  // --------------------------------------------------
  // OTP input
  // --------------------------------------------------

  function handleCodeChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setCode(value);
    setError("");
  }

  // --------------------------------------------------
  // Reset password
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (code.length !== 6) {
      setError(
        "Enter the 6-digit reset code.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Your new password must be at least 8 characters.",
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "The passwords do not match.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(
        normalizedEmail,
        code,
        newPassword,
      );

      localStorage.removeItem(
        PASSWORD_RESET_EMAIL_KEY,
      );

      setSuccess(
        "Password reset successfully. Taking you to sign in...",
      );

      window.setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
          },
        );
      }, 1200);
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
          "Unable to reset your password. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // --------------------------------------------------
  // Resend reset code
  // --------------------------------------------------

  async function handleResend() {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail ||
      resendCooldown > 0 ||
      isResending
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      await requestPasswordReset(
        normalizedEmail,
      );

      localStorage.setItem(
        PASSWORD_RESET_EMAIL_KEY,
        normalizedEmail,
      );

      setCode("");
      setResendCooldown(60);

      setSuccess(
        "If an account exists for this email, a new reset code has been sent.",
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
          "Unable to resend the reset code. Please try again later.",
        );
      }
    } finally {
      setIsResending(false);
    }
  }

  // --------------------------------------------------
  // Back to login
  // --------------------------------------------------

  function handleBackToLogin() {
    localStorage.removeItem(
      PASSWORD_RESET_EMAIL_KEY,
    );

    navigate(
      "/login",
      {
        replace: true,
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
      {/* Ambient purple glow */}

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
          {/* Dasaiko logo */}

          <button
            type="button"
            onClick={handleBackToLogin}
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
              className="h-auto w-[145px]"
            />
          </button>

          {/* Main card */}

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
            {/* Icon */}

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
              <KeyRound
                className="
                  h-6
                  w-6
                  text-primary
                "
              />
            </div>

            {/* Heading */}

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
                Password recovery
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
                Create a new password.
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
                Enter the code sent to{" "}
                <span className="text-zinc-300">
                  {maskedEmail}
                </span>
                .
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Reset code */}

              <div className="space-y-2.5">
                <label
                  htmlFor="reset-code"
                  className="
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  Reset code
                </label>

                <input
                  id="reset-code"
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
                    h-[68px]
                    w-full
                    rounded-[16px]
                    border-[1.5px]
                    border-white/[0.10]
                    bg-[#050507]
                    px-5
                    text-center
                    text-[27px]
                    font-bold
                    tracking-[0.4em]
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

              {/* New password */}

              <div className="space-y-2.5">
                <label
                  htmlFor="new-password"
                  className="
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  New password
                </label>

                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  placeholder="At least 8 characters"
                  className="
                    h-[58px]
                    w-full
                    rounded-[15px]
                    border-[1.5px]
                    border-white/[0.10]
                    bg-[#08080b]
                    px-4
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

              {/* Confirm password */}

              <div className="space-y-2.5">
                <label
                  htmlFor="confirm-password"
                  className="
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter it again"
                  className="
                    h-[58px]
                    w-full
                    rounded-[15px]
                    border-[1.5px]
                    border-white/[0.10]
                    bg-[#08080b]
                    px-4
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

              {/* Error */}

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

              {/* Success */}

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

              {/* Submit */}

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
                <span className="relative">
                  {isSubmitting
                    ? "Resetting password..."
                    : "Reset password"}
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

            {/* Secondary actions */}

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
                onClick={handleBackToLogin}
                className="
                  text-[10px]
                  font-bold
                  text-zinc-600
                  transition-colors
                  hover:text-white
                "
              >
                Back to sign in
              </button>
            </div>
          </div>

          {/* Footer */}

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

            Reset codes expire in 10 minutes
          </div>
        </div>
      </div>
    </main>
  );
}