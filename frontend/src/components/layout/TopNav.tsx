import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Command,
  LogOut,
} from "lucide-react";

import { useCommandPalette } from "@/hooks/useCommandPalette";
import { CommandPalette } from "./CommandPalette";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuth } from "@/context/AuthContext";

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [commandOpen, setCommandOpen] = useState(false);

  const { documents } = useWorkspaceStore();
  const { user, logout } = useAuth();

  useCommandPalette(() => setCommandOpen((v) => !v));

  const isWorkspace = location.pathname === "/workspace";

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
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
          duration: 0.35,
          ease: "easeOut",
        }}
        className="
          relative
          z-40
          flex
          min-h-[68px]
          shrink-0
          items-center
          justify-between
          gap-6
          border-b
          border-white/[0.10]
          bg-[#070707]/95
          px-5
          py-3
          backdrop-blur-xl
          sm:px-6
        "
      >
        {/* =====================================================
            LEFT
        ====================================================== */}

        <div className="flex min-w-0 items-center">
          {!isWorkspace && (
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Dasaiko home"
              className="
                flex
                items-center
                transition-opacity
                hover:opacity-80
              "
            >
              <img
                src="/assets/brand/dasaiko-horizontal.png"
                alt="Dasaiko"
                className="h-7 w-auto object-contain"
              />
            </button>
          )}

          {isWorkspace && (
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[15px]
                    font-bold
                    tracking-[-0.02em]
                    text-white
                  "
                >
                  Research Workbench
                </p>

                <p
                  className="
                    mt-0.5
                    hidden
                    text-[10px]
                    font-medium
                    text-zinc-400
                    sm:block
                  "
                >
                  Your research workspace
                </p>
              </div>

              <span
                className="
                  shrink-0
                  rounded-lg
                  border
                  border-white/[0.12]
                  bg-white/[0.045]
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  tracking-wide
                  text-zinc-300
                "
              >
                {documents.length}{" "}
                {documents.length === 1 ? "DOC" : "DOCS"}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            CENTER — SEARCH
        ====================================================== */}

        {isWorkspace && (
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="
              group
              absolute
              left-1/2
              hidden
              h-11
              w-[280px]
              -translate-x-1/2
              items-center
              gap-3
              rounded-xl
              border
              border-white/[0.14]
              bg-[#0D0D0D]
              px-4
              text-left
              shadow-[0_8px_30px_rgba(0,0,0,0.28)]
              transition-all
              duration-200
              hover:border-white/[0.24]
              hover:bg-[#111111]
              md:flex
            "
          >
            <Search
              className="
                h-4
                w-4
                shrink-0
                text-zinc-400
                transition-colors
                group-hover:text-white
              "
            />

            <span
              className="
                flex-1
                text-[12px]
                font-semibold
                text-zinc-400
                transition-colors
                group-hover:text-zinc-200
              "
            >
              Search or ask...
            </span>

            <span
              className="
                flex
                items-center
                gap-1
                rounded-md
                border
                border-white/[0.10]
                bg-white/[0.035]
                px-1.5
                py-1
                font-mono
                text-[9px]
                font-semibold
                text-zinc-500
              "
            >
              <Command className="h-3 w-3" />
              K
            </span>
          </button>
        )}

        {/* =====================================================
            RIGHT
        ====================================================== */}

        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          {!isWorkspace && (
            <>
              <button
                type="button"
                onClick={() => navigate("/workspace")}
                className="
                  hidden
                  rounded-xl
                  border
                  border-white/[0.10]
                  bg-white/[0.025]
                  px-4
                  py-2.5
                  text-[12px]
                  font-bold
                  text-zinc-300
                  transition-all
                  duration-200
                  hover:border-white/[0.20]
                  hover:bg-white/[0.06]
                  hover:text-white
                  sm:block
                "
              >
                Open Workspace
              </button>

              <button
                type="button"
                onClick={() => navigate("/workspace")}
                className="
                  rounded-xl
                  border
                  border-white/[0.10]
                  bg-white
                  px-4
                  py-2.5
                  text-[12px]
                  font-bold
                  text-black
                  transition-all
                  duration-200
                  hover:scale-[1.02]
                  hover:bg-zinc-100
                  hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]
                "
              >
                Get Started
              </button>
            </>
          )}

          {isWorkspace && user && (
            <div className="flex items-center gap-2">
              {/* User */}

              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  rounded-xl
                  border
                  border-white/[0.10]
                  bg-white/[0.035]
                  px-2.5
                  py-1.5
                  transition-colors
                  duration-200
                  hover:border-white/[0.18]
                  hover:bg-white/[0.055]
                "
                title={user.email ?? ""}
              >
                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-white/[0.12]
                    bg-gradient-to-br
                    from-primary
                    to-secondary
                    text-[10px]
                    font-black
                    text-white
                    shadow-[0_0_18px_rgba(99,102,241,0.15)]
                  "
                >
                  {(
                    user.username?.[0] ??
                    user.email?.[0] ??
                    "U"
                  ).toUpperCase()}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p
                    className="
                      max-w-[130px]
                      truncate
                      text-[11px]
                      font-bold
                      text-zinc-200
                    "
                  >
                    {user.username ?? user.email ?? "User"}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[9px]
                      font-medium
                      text-zinc-500
                    "
                  >
                    Researcher
                  </p>
                </div>
              </div>

              {/* Divider */}

              <div className="hidden h-7 w-px bg-white/[0.10] sm:block" />

              {/* Sign out */}

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="
                  group
                  flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.10]
                  bg-white/[0.025]
                  px-3
                  text-zinc-500
                  transition-all
                  duration-200
                  hover:border-white/[0.20]
                  hover:bg-white/[0.07]
                  hover:text-white
                "
              >
                <LogOut
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    group-hover:translate-x-0.5
                  "
                />

                <span
                  className="
                    hidden
                    text-[11px]
                    font-bold
                    sm:inline
                  "
                >
                  Sign out
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* =====================================================
          COMMAND PALETTE
      ====================================================== */}

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </>
  );
}