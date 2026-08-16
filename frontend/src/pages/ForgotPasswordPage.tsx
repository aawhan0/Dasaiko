import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  PASSWORD_RESET_EMAIL_KEY,
  requestPasswordReset,
} from "@/services/auth";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
      await requestPasswordReset(
        normalizedEmail,
      );

      localStorage.setItem(
        PASSWORD_RESET_EMAIL_KEY,
        normalizedEmail,
      );

      navigate(
        "/reset-password",
        {
          replace: true,
          state: {
            email: normalizedEmail,
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
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to process your request. Please try again later.",
        );
      }
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
          <button
            type="button"
            onClick={() =>
              navigate("/login")
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
              className="h-auto w-[145px]"
            />
          </button>

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
              <LockKeyhole
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
                Forgot your password?
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
                Enter your email and we'll
                send you a secure code to
                reset your password.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-2.5">
                <label
                  htmlFor="reset-email"
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
                    id="reset-email"
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
                  disabled:opacity-50
                  disabled:hover:scale-100
                "
              >
                <span className="relative">
                  {isSubmitting
                    ? "Sending code..."
                    : "Send reset code"}
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
                border-t
                border-white/[0.06]
                pt-6
                text-center
              "
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="
                  text-xs
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