import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          y: 45,
          opacity: 0,
          scale: 0.985,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="
        relative
        overflow-hidden
        bg-base
        py-24
        sm:py-32
        md:py-36
      "
    >
      {/* =====================================================
          ATMOSPHERE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[560px]
          w-[560px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.045]
          blur-[170px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[260px]
          w-[600px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-purple-500/[0.025]
          blur-[100px]
        "
        aria-hidden="true"
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        ref={contentRef}
        className="
          relative
          z-10
          mx-auto
          max-w-4xl
          px-6
          text-center
        "
      >
        {/* =================================================
            EYEBROW
        ================================================== */}

        <div
          className="
            inline-flex
            items-center
            gap-2.5
            rounded-full
            border-[1.5px]
            border-primary/25
            bg-primary/[0.045]
            px-4
            py-2.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.20em]
            text-primary
          "
        >
          <Sparkles
            className="
              h-3.5
              w-3.5
              stroke-[2.5]
            "
          />

          Start your research
        </div>

        {/* =================================================
            HEADLINE
        ================================================== */}

        <h2
          className="
            mt-8
            text-5xl
            font-black
            leading-[0.92]
            tracking-[-0.065em]
            text-white
            sm:text-6xl
            md:text-7xl
            lg:text-[82px]
          "
        >
          Stop searching.
          <br />

          <span
            className="
              font-black
              text-zinc-500
            "
          >
            Start understanding.
          </span>
        </h2>

        {/* =================================================
            DESCRIPTION
        ================================================== */}

        <p
          className="
            relative
            z-20
            mx-auto
            mt-7
            max-w-2xl
            text-[15px]
            font-semibold
            leading-7
            !text-zinc-300
            opacity-100
            sm:text-base
            md:text-[17px]
          "
        >
          Bring your papers, documents, and questions into
          one research workspace built around evidence,
          context, and sources you can actually verify.
        </p>

        {/* =================================================
            CTA
        ================================================== */}

        <div className="mt-9 flex justify-center">
          <button
            type="button"
            data-cursor="view"
            onClick={() => navigate("/login")}
            className="
              group
              relative
              flex
              items-center
              gap-3
              overflow-hidden
              rounded-xl
              border-[1.5px]
              border-white
              bg-white
              px-7
              py-4
              text-sm
              font-extrabold
              text-black
              shadow-[0_12px_40px_rgba(255,255,255,0.08)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:scale-[1.025]
              hover:shadow-[0_18px_55px_rgba(139,92,246,0.20)]
            "
          >
            {/* Button sweep */}

            <span
              className="
                pointer-events-none
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-black/[0.08]
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
                stroke-[2.5]
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </div>

        {/* =================================================
            SUPPORTING SIGNAL
        ================================================== */}

        <div
          className="
            mt-10
            flex
            items-center
            justify-center
            gap-2.5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.18em]
            !text-zinc-500
            opacity-100
          "
        >
          <span
            className="
              h-px
              w-10
              bg-zinc-700
            "
          />

          <span>
            Research
          </span>

          <span className="text-zinc-700">
            /
          </span>

          <span>
            Retrieval
          </span>

          <span className="text-zinc-700">
            /
          </span>

          <span>
            Evidence
          </span>

          <span
            className="
              h-px
              w-10
              bg-zinc-700
            "
          />
        </div>
      </div>

      {/* =====================================================
          VERY SUBTLE BOTTOM FADE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-24
          bg-gradient-to-t
          from-base
          to-transparent
        "
        aria-hidden="true"
      />
    </section>
  );
}