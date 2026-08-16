import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getCurrentUser,
} from "@/services/auth";

import {
  useAuth,
} from "@/context/AuthContext";


export function GoogleCallbackPage() {

  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    user,
  } = useAuth();

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(true);


  useEffect(() => {

    let cancelled = false;


    async function completeGoogleLogin() {

      const token =
        searchParams.get(
          "token",
        );


      /*
       * Google OAuth may also return
       * an error parameter.
       */

      const oauthError =
        searchParams.get(
          "error",
        );


      if (oauthError) {

        if (!cancelled) {

          setError(
            "Google sign-in was cancelled or failed.",
          );

          setIsProcessing(false);

        }

        return;
      }


      /*
       * The backend must provide
       * the Dasaiko JWT.
       */

      if (!token) {

        if (!cancelled) {

          setError(
            "Google sign-in failed because no authentication token was received.",
          );

          setIsProcessing(false);

        }

        return;
      }


      try {

        /*
         * Store the JWT using the same
         * mechanism as normal login.
         */

        localStorage.setItem(
          "token",
          token,
        );


        /*
         * Immediately validate the token
         * and retrieve the authenticated user.
         */

        await getCurrentUser();


        if (cancelled) {
          return;
        }


        /*
         * AuthContext will also restore this
         * token on its next render/effect.
         */

        navigate(
          "/workspace",
          {
            replace: true,
          },
        );

      } catch (requestError) {

        console.error(
          "Google authentication failed:",
          requestError,
        );


        localStorage.removeItem(
          "token",
        );


        if (!cancelled) {

          setError(
            "Google sign-in could not be completed. Please try again.",
          );

          setIsProcessing(false);

        }

      }

    }


    completeGoogleLogin();


    return () => {

      cancelled = true;

    };

  }, [
    navigate,
    searchParams,
  ]);


  /*
   * If AuthContext has already restored the
   * authenticated user, go straight to workspace.
   */

  if (
    user &&
    !error
  ) {

    return (
      <Navigate
        to="/workspace"
        replace
      />
    );

  }


  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#050507]
        px-6
        text-white
      "
    >

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-white/[0.08]
          bg-white/[0.025]
          p-8
          text-center
          shadow-2xl
        "
      >

        {isProcessing ? (

          <>

            <div
              className="
                mx-auto
                mb-6
                h-10
                w-10
                animate-spin
                rounded-full
                border-2
                border-white/[0.10]
                border-t-primary
              "
            />

            <h1
              className="
                text-lg
                font-bold
                text-white
              "
            >
              Signing you in...
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-zinc-500
              "
            >
              Completing your Google authentication.
            </p>

          </>

        ) : (

          <>

            <div
              className="
                mx-auto
                mb-6
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-red-500/20
                bg-red-500/[0.08]
                text-red-400
              "
            >
              !
            </div>

            <h1
              className="
                text-lg
                font-bold
                text-white
              "
            >
              Google sign-in failed
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-zinc-500
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login",
                  {
                    replace: true,
                  },
                )
              }
              className="
                mt-6
                w-full
                rounded-xl
                bg-white
                px-4
                py-3
                text-sm
                font-bold
                text-black
                transition
                hover:bg-zinc-200
              "
            >
              Back to sign in
            </button>

          </>

        )}

      </div>

    </main>
  );
}