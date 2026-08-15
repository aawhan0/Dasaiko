import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import DecryptedText from "@/components/DecryptedText";

gsap.registerPlugin(ScrollTrigger);

const originalQuery =
  "How does attention improve machine translation?";

const rewrittenQuery =
  "How do attention mechanisms improve neural machine translation through encoder–decoder alignment, context vectors, and translation quality?";

export function QueryRewriteDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const [isRewritten, setIsRewritten] = useState(false);

  /* ==========================================================
     SECTION ENTRANCE
  ========================================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        demoRef.current,
        {
          y: 55,
          opacity: 0,
          scale: 0.985,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          delay: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 68%",
            once: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  /* ==========================================================
     QUERY REWRITE
  ========================================================== */

  const handleRewrite = () => {
    if (isRewritten) {
      setIsRewritten(false);

      window.setTimeout(() => {
        setIsRewritten(true);
      }, 180);

      return;
    }

    setIsRewritten(true);
  };

  return (
    <section
      ref={sectionRef}
      id="query-rewrite"
      className="
        relative
        isolate
        overflow-hidden
        bg-transparent
        py-32
        sm:py-40
      "
    >
      {/* ======================================================
          SMOOTH TOP TRANSITION

          Prevents the purple atmosphere from beginning as a
          hard horizontal block.
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-0
          h-64
          bg-gradient-to-b
          from-base
          via-base/75
          to-transparent
        "
        aria-hidden="true"
      />

      {/* ======================================================
          AMBIENT PURPLE ATMOSPHERE
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          z-0
          h-[620px]
          w-[720px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.035]
          blur-[180px]
        "
        aria-hidden="true"
      />

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-6xl
          px-6
        "
      >
        {/* ====================================================
            HEADING
        ===================================================== */}

        <div
          ref={headingRef}
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          {/* ==================================================
              EYEBROW
          =================================================== */}

          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary/25
              bg-primary/[0.05]
              px-4
              py-2
              text-[9px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-primary
              shadow-[0_0_30px_rgba(139,92,246,0.07)]
            "
          >
            <Wand2 className="h-3.5 w-3.5" />

            Query intelligence
          </div>

          {/* ==================================================
              MAIN HEADLINE
          =================================================== */}

          <h2
            className="
              text-5xl
              font-black
              leading-[0.92]
              tracking-[-0.065em]
              text-white
              drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]
              sm:text-6xl
              md:text-7xl
              lg:text-[78px]
            "
          >
            <span className="text-white">
              Ask naturally.
            </span>

            <br />

            <span className="text-zinc-300">
              Search precisely.
            </span>
          </h2>

          {/* ==================================================
              SUBTITLE
          =================================================== */}

          <p
            className="
              relative
              z-20
              mx-auto
              mt-7
              max-w-2xl
              !text-[#D4D4D8]
              text-sm
              font-semibold
              leading-7
              drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]
              sm:text-base
            "
          >
            You don't need to know how to phrase the perfect
            search query. Dasaiko understands your intent and
            rewrites it into focused retrieval queries.
          </p>
        </div>

        {/* ====================================================
            DEMO
        ===================================================== */}

        <div
          ref={demoRef}
          className="
            relative
            mx-auto
            mt-16
            max-w-5xl
          "
        >
          {/* ==================================================
              MAIN APPLICATION FRAME
          =================================================== */}

          <div
            className="
              overflow-hidden
              rounded-[30px]
              border-2
              border-white/[0.13]
              bg-[#07070a]/95
              shadow-[0_35px_120px_rgba(0,0,0,0.55)]
              backdrop-blur-xl
            "
          >
            {/* =================================================
                HEADER
            ================================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b-2
                border-white/[0.07]
                px-6
                py-4
                sm:px-8
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.20em]
                  text-zinc-400
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-primary
                    shadow-[0_0_10px_rgba(139,92,246,0.65)]
                  "
                />

                Query processor
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-zinc-500
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-400
                    shadow-[0_0_8px_rgba(52,211,153,0.5)]
                  "
                />

                Ready
              </div>
            </div>

            {/* =================================================
                QUERY PANELS
            ================================================== */}

            <div className="grid md:grid-cols-2">
              {/* =================================================
                  YOUR QUESTION
              ================================================== */}

              <div
                className="
                  border-b-2
                  border-white/[0.07]
                  p-7
                  md:border-b-0
                  md:border-r-2
                  md:p-9
                "
              >
                <div
                  className="
                    mb-7
                    flex
                    items-center
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border-2
                        border-white/[0.11]
                        bg-white/[0.035]
                      "
                    >
                      <Search
                        className="
                          h-4
                          w-4
                          text-zinc-300
                        "
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-zinc-200
                        "
                      >
                        Your question
                      </p>

                      <p
                        className="
                          mt-1
                          text-[9px]
                          font-medium
                          text-zinc-500
                        "
                      >
                        Natural language
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ORIGINAL QUESTION CARD
                ================================================== */}

                <div
                  className="
                    min-h-[170px]
                    rounded-2xl
                    border-2
                    border-white/[0.10]
                    bg-white/[0.018]
                    p-6
                    shadow-inner
                    sm:p-7
                  "
                >
                  <p
                    className="
                      text-base
                      font-semibold
                      leading-7
                      text-zinc-200
                      sm:text-lg
                    "
                  >
                    "{originalQuery}"
                  </p>
                </div>
              </div>

              {/* =================================================
                  RESEARCH QUERY

                  PRIMARY VISUAL FOCUS
              ================================================== */}

              <div
                className="
                  relative
                  overflow-hidden
                  bg-gradient-to-br
                  from-primary/[0.10]
                  via-primary/[0.045]
                  to-transparent
                  p-7
                  md:p-9
                "
              >
                {/* =================================================
                    STRONG PURPLE OUTLINE
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    border-2
                    border-primary/[0.22]
                  "
                  aria-hidden="true"
                />

                {/* =================================================
                    INTERNAL GLOW
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-24
                    h-64
                    w-64
                    rounded-full
                    bg-primary/[0.12]
                    blur-[80px]
                  "
                  aria-hidden="true"
                />

                {/* =================================================
                    RESEARCH QUERY HEADER
                ================================================== */}

                <div
                  className="
                    relative
                    z-10
                    mb-7
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border-2
                        border-primary/40
                        bg-primary/[0.14]
                        shadow-[0_0_24px_rgba(139,92,246,0.14)]
                      "
                    >
                      <Brain
                        className="
                          h-4
                          w-4
                          text-primary
                        "
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-white
                        "
                      >
                        Research query
                      </p>

                      <p
                        className="
                          mt-1
                          text-[9px]
                          font-semibold
                          text-primary/80
                        "
                      >
                        Focused retrieval
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      rounded-full
                      border
                      border-primary/35
                      bg-primary/[0.10]
                      px-2.5
                      py-1.5
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-primary
                    "
                  >
                    AI
                  </span>
                </div>

                {/* =================================================
                    REWRITTEN QUERY CARD
                ================================================== */}

                <div
                  className="
                    relative
                    z-10
                    min-h-[170px]
                    rounded-2xl
                    border-2
                    border-primary/30
                    bg-[#0B0912]/90
                    p-6
                    shadow-[0_0_40px_rgba(139,92,246,0.08),inset_0_0_45px_rgba(139,92,246,0.035)]
                    sm:p-7
                  "
                >
                  {!isRewritten ? (
                    <div
                      className="
                        flex
                        min-h-[110px]
                        items-center
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-medium
                          leading-6
                          text-zinc-400
                        "
                      >
                        Click{" "}
                        <span className="font-semibold text-zinc-200">
                          "Rewrite query"
                        </span>{" "}
                        to turn the question into a more focused
                        retrieval query.
                      </span>
                    </div>
                  ) : (
                    <DecryptedText
                      text={rewrittenQuery}
                      speed={35}
                      maxIterations={8}
                      sequential
                      revealDirection="start"
                      animateOn="view"
                      className="
                        !text-[#E9D5FF]
                        text-sm
                        font-semibold
                        leading-7
                        drop-shadow-[0_2px_12px_rgba(139,92,246,0.18)]
                        sm:text-base
                      "
                      encryptedClassName="!text-[#A78BFA]/35"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                ACTION BAR
            ================================================== */}

            <div
              className="
                flex
                flex-col
                gap-5
                border-t-2
                border-white/[0.07]
                bg-white/[0.018]
                px-7
                py-6
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-9
              "
            >
              {/* Useful product signal */}

              <div
                className="
                  flex
                  items-center
                  gap-2.5
                "
              >
                <Sparkles
                  className="
                    h-3.5
                    w-3.5
                    text-primary
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-zinc-500
                  "
                >
                  Intent → concepts → retrieval terms
                </span>
              </div>

              {/* =================================================
                  CTA
              ================================================== */}

              <button
                type="button"
                data-cursor="view"
                onClick={handleRewrite}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  border-2
                  border-primary/50
                  bg-primary
                  px-6
                  py-3.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-white
                  shadow-[0_0_30px_rgba(139,92,246,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-primary
                  hover:bg-primary/90
                  hover:shadow-[0_0_45px_rgba(139,92,246,0.30)]
                "
              >
                {isRewritten ? "Rewrite again" : "Rewrite query"}

                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SMOOTH BOTTOM TRANSITION

          Fades the purple atmosphere gradually back into the
          global Dasaiko base background.
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          z-20
          h-40
          bg-gradient-to-b
          from-transparent
          via-base/40
          to-base
        "
        aria-hidden="true"
      />
    </section>
  );
}