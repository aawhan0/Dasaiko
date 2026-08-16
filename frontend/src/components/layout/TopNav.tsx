import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  LogOut,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  CommandPalette,
} from "./CommandPalette";

import {
  useCommandPalette,
} from "@/hooks/useCommandPalette";

import {
  useState,
} from "react";


export function TopNav() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    commandOpen,
    setCommandOpen,
  ] = useState(false);


  const {
    user,
    logout,
  } = useAuth();


  useCommandPalette(
    () =>
      setCommandOpen(
        (value) => !value,
      ),
  );


  const isWorkspace =
    location.pathname ===
    "/workspace";


  const handleLogout =
    () => {

      logout();

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    };


  return (
    <>
      <motion.header
        initial={{
          y: -6,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        className="
          relative
          z-40
          flex
          min-h-[64px]
          shrink-0
          items-center
          justify-between
          border-b
          border-white/[0.06]
          bg-[#060606]
          px-5
          sm:px-7
        "
      >

        {/* =================================================
            LEFT
        ================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-4
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            aria-label="Dasaiko home"
            className="
              shrink-0
              transition-opacity
              duration-200
              hover:opacity-80
            "
          >

            <img
              src="/assets/brand/dasaiko-wordmark-transparent-bg.png"
              alt="Dasaiko"
              className="
                h-9
                w-auto
                object-contain
              "
            />

          </button>


          {isWorkspace && (
            <>
              <span
                className="
                  h-5
                  w-px
                  bg-white/[0.08]
                "
              />

              <span
                className="
                  text-[12px]
                  font-medium
                  tracking-tight
                  text-zinc-500
                "
              >
                Research Workspace
              </span>
            </>
          )}

        </div>


        {/* =================================================
            RIGHT
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >

          {isWorkspace && user && (

            <>

              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-2
                  py-1.5
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
                    bg-primary
                    text-[10px]
                    font-black
                    text-white
                  "
                >
                  {(
                    user.username?.[0] ??
                    user.email?.[0] ??
                    "U"
                  ).toUpperCase()}
                </div>


                <div
                  className="
                    hidden
                    sm:block
                  "
                >

                  <p
                    className="
                      max-w-[120px]
                      truncate
                      text-[11px]
                      font-semibold
                      text-zinc-300
                    "
                  >
                    {user.username ??
                      user.email ??
                      "User"}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  handleLogout
                }
                aria-label="Sign out"
                title="Sign out"
                className="
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-3
                  text-zinc-600
                  transition-all
                  duration-200
                  hover:border-white/[0.14]
                  hover:bg-white/[0.05]
                  hover:text-zinc-200
                "
              >

                <LogOut
                  className="
                    h-4
                    w-4
                  "
                />

                <span
                  className="
                    hidden
                    text-[10px]
                    font-semibold
                    sm:inline
                  "
                >
                  Sign out
                </span>

              </button>

            </>

          )}

        </div>

      </motion.header>


      <CommandPalette
        open={commandOpen}
        onClose={() =>
          setCommandOpen(false)
        }
      />

    </>
  );
}