import { useNavigate } from "react-router-dom";
import { DasaikoLogo } from "@/components/brand/DasaikoLogo";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

export function LandingFooter() {
  const navigate = useNavigate();

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const linkClass = `
    block
    text-sm
    font-semibold
    text-zinc-500
    transition-all
    duration-300
    hover:translate-x-0.5
    hover:text-white
  `;

  const socialClass = `
    group
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-xl
    border-[1.5px]
    border-white/[0.10]
    bg-white/[0.025]
    text-xs
    font-black
    text-zinc-400
    transition-all
    duration-300
    hover:border-white
    hover:bg-white
    hover:text-black
    hover:-translate-y-0.5
  `;

  return (
    <footer
      className="
        relative
        overflow-hidden
        border-t-[1.5px]
        border-white/[0.10]
        bg-[#070709]
        px-6
        py-20
        sm:py-24
      "
    >
      {/* =====================================================
          AMBIENT LIGHT
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-48
          left-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          rounded-full
          bg-primary/[0.045]
          blur-[150px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-px
          w-2/3
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-primary/[0.25]
          to-transparent
        "
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* =================================================
            MAIN FOOTER GRID
        ================================================== */}

        <div
          className="
            grid
            gap-14
            lg:grid-cols-[2fr_1fr_1fr]
            lg:gap-20
          "
        >
          {/* =================================================
              BRAND
          ================================================== */}

          <div>
            <button
              type="button"
              onClick={scrollTop}
              className="
                group
                flex
                items-center
                gap-3
              "
            >
              <DasaikoLogo
                size="md"
                variant="gradient"
              />
            </button>

            <p
              className="
                mt-6
                max-w-md
                text-[15px]
                font-semibold
                leading-7
                !text-zinc-300
              "
            >
              An AI research workspace built around
              retrieval, evidence, and persistent research
              context — so you can spend less time searching
              and more time understanding.
            </p>

            {/* CTA */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                group
                mt-7
                flex
                items-center
                gap-3
                rounded-xl
                border-[1.5px]
                border-white
                bg-white
                px-5
                py-3
                text-sm
                font-extrabold
                text-black
                shadow-[0_10px_35px_rgba(255,255,255,0.06)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:scale-[1.02]
                hover:shadow-[0_15px_45px_rgba(139,92,246,0.18)]
              "
            >
              <span>
                Start researching
              </span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  stroke-[2.5]
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>
          </div>

          {/* =================================================
              PRODUCT
          ================================================== */}

          <div>
            <h3
              className="
                text-[11px]
                font-black
                uppercase
                tracking-[0.20em]
                text-white
              "
            >
              Product
            </h3>

            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() => scrollTo("features")}
                className={linkClass}
              >
                Features
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollTo("workspace-showcase")
                }
                className={linkClass}
              >
                Workspace
              </button>

              <button
                type="button"
                onClick={() => scrollTo("evidence")}
                className={linkClass}
              >
                Evidence
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className={linkClass}
              >
                Sign in
              </button>
            </div>
          </div>

          {/* =================================================
              CONNECT
          ================================================== */}

          <div>
            <h3
              className="
                text-[11px]
                font-black
                uppercase
                tracking-[0.20em]
                text-white
              "
            >
              Connect
            </h3>

            <div className="mt-6 flex gap-3">
              {/* GitHub */}

              <a
                href="https://github.com/aawhan0/Dasaiko"
                target="_blank"
                rel="noreferrer"
                aria-label="Dasaiko GitHub repository"
                data-cursor="view"
                className={socialClass}
              >
                GH
              </a>

              {/* LinkedIn */}

              <a
                href="https://www.linkedin.com/in/aawhanvyas/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                data-cursor="view"
                className={socialClass}
              >
                in
              </a>
            </div>

            <p
              className="
                mt-6
                max-w-[230px]
                text-sm
                font-semibold
                leading-6
                !text-zinc-400
              "
            >
              Built for people who want to understand
              where their answers come from.
            </p>
          </div>
        </div>

        {/* =================================================
            DIVIDER
        ================================================== */}

        <div
          className="
            mt-16
            border-t-[1.5px]
            border-white/[0.09]
            pt-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* Copyright */}

            <p
              className="
                text-[11px]
                font-semibold
                text-zinc-500
              "
            >
              © {new Date().getFullYear()} Dasaiko.
              All rights reserved.
            </p>

            {/* Back to top */}

            <button
              type="button"
              onClick={scrollTop}
              className="
                group
                flex
                items-center
                gap-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-zinc-500
                transition-colors
                duration-300
                hover:text-white
              "
            >
              Back to top

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}