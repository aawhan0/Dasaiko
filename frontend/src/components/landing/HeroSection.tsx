import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import BlurText from "@/components/BlurText";
import Magnet from "@/components/Magnet";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-transparent
      "
    >
      {/* =====================================================
          HERO CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-7xl
          flex-col
          items-center
          justify-center
          px-6
          pb-20
          pt-28
          text-center
          sm:px-8
        "
      >
        {/* =================================================
            STATUS PILL
        ================================================== */}

        <div
          className="
            mb-7
            inline-flex
            items-center
            gap-2.5
            rounded-full
            border
            border-violet-400/25
            bg-black/45
            px-4
            py-2
            shadow-[0_0_30px_rgba(124,58,237,0.10)]
            backdrop-blur-xl
          "
        >
          <span className="relative flex h-2 w-2">
            <span
              className="
                absolute
                inset-0
                animate-ping
                rounded-full
                bg-violet-400
                opacity-60
              "
            />

            <span
              className="
                relative
                h-2
                w-2
                rounded-full
                bg-violet-400
                shadow-[0_0_10px_rgba(168,85,247,0.9)]
              "
            />
          </span>

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.20em]
              text-zinc-200
            "
          >
            AI Research Workspace
          </span>
        </div>

        {/* =================================================
            MAIN HEADLINE
        ================================================== */}

        <div className="w-full max-w-6xl">
          <BlurText
            text="The AI that shows its work."
            delay={70}
            animateBy="words"
            direction="top"
            className="
              justify-center
              text-5xl
              font-black
              leading-[0.94]
              tracking-[-0.065em]
              text-white
              drop-shadow-[0_4px_30px_rgba(0,0,0,0.55)]
              sm:text-6xl
              md:text-7xl
              lg:text-[92px]
            "
          />
        </div>

        {/* =================================================
            DESCRIPTION
        ================================================== */}

        <p
          className="
            mt-7
            max-w-2xl
            text-[15px]
            font-medium
            leading-7
            !text-zinc-200
            drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]
            sm:text-base
            sm:leading-7
          "
        >
          Research papers, technical documents and knowledge —
          retrieved, reasoned over, and backed by evidence you
          can actually verify.
        </p>

        {/* =================================================
            PRIMARY CTA
        ================================================== */}

        <div className="mt-9">
          <Magnet
            padding={70}
            disabled={false}
            magnetStrength={2}
          >
            <button
              type="button"
              data-cursor="view"
              onClick={() => navigate("/login")}
              className="
                group
                relative
                flex
                min-w-[205px]
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-xl
                border
                border-white
                bg-white
                px-7
                py-4
                text-[15px]
                font-extrabold
                tracking-[-0.01em]
                text-black
                shadow-[0_12px_45px_rgba(0,0,0,0.35)]
                transition-all
                duration-300
                hover:scale-[1.025]
                hover:shadow-[0_16px_55px_rgba(139,92,246,0.28)]
              "
            >
              {/* Button shine */}

              <span
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-black/[0.07]
                  to-transparent
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />

              <span className="relative z-10">
                Start researching
              </span>

              <ArrowRight
                className="
                  relative
                  z-10
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>
          </Magnet>
        </div>
      </div>

      {/* =====================================================
          HERO → NEXT SECTION FADE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          z-[3]
          h-28
          bg-gradient-to-t
          from-base
          via-base/45
          to-transparent
        "
      />
    </section>
  );
}