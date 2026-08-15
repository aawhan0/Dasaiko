import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Check,
  Database,
  FileSearch,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Beams from "@/components/Beams";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   RESEARCH PIPELINE
============================================================ */

const stages = [
  {
    title: "Ask",
    icon: MessageSquare,
    eyebrow: "YOUR QUESTION",
    value: "How does attention improve machine translation?",
    meta: "Natural language",
  },
  {
    title: "Understand",
    icon: Brain,
    eyebrow: "RESEARCH INTENT",
    value: "attention · sequence modeling · translation",
    meta: "Query intelligence",
  },
  {
    title: "Retrieve",
    icon: Database,
    eyebrow: "KNOWLEDGE RETRIEVAL",
    value: "12 relevant passages · 4 research papers",
    meta: "Semantic retrieval",
  },
  {
    title: "Evidence",
    icon: FileSearch,
    eyebrow: "SOURCE VERIFIED",
    value: "Attention Is All You Need · Page 4",
    meta: "96% relevance",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

export function ResearchFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState(0);

  const stage = stages[activeStage];
  const ActiveIcon = stage.icon;

  /* ==========================================================
     AUTOMATIC PROGRESSION

     The user doesn't have to click the stages.
     Dasaiko demonstrates the pipeline automatically.
  ========================================================== */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((current) =>
        current === stages.length - 1 ? 0 : current + 1
      );
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  /* ==========================================================
     SECTION ENTRANCE
  ========================================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          {
            opacity: 0,
            y: 28,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true,
            },
          }
        );
      }

      if (pipelineRef.current) {
        gsap.fromTo(
          pipelineRef.current,
          {
            opacity: 0,
            y: 36,
            scale: 0.985,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            delay: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  /* ==========================================================
     ACTIVE CONTENT TRANSITION
  ========================================================== */

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      {
        opacity: 0,
        y: 10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.38,
        ease: "power2.out",
      }
    );
  }, [activeStage]);

  return (
    <section
      ref={sectionRef}
      id="research-flow"
      className="
        relative
        overflow-hidden
        bg-base
        py-24
        sm:py-28
        lg:py-32
      "
    >
      {/* ======================================================
          AMBIENT ATMOSPHERE
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[520px]
          w-[760px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.045]
          blur-[160px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[42%]
          h-[260px]
          w-[520px]
          -translate-x-1/2
          rounded-full
          bg-violet-950/[0.08]
          blur-[120px]
        "
      />

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-5
          sm:px-8
        "
      >
        {/* ====================================================
            SECTION HEADING
        ===================================================== */}

        <div
          ref={headingRef}
          className="
            research-flow-heading
            mx-auto
            max-w-5xl
            text-center
          "
        >
          {/* Eyebrow */}

          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2.5
              rounded-full
              border
              border-primary/20
              bg-black/40
              px-4
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-primary
              backdrop-blur-md
            "
          >
            <Sparkles className="h-3.5 w-3.5" />

            Research engine
          </div>

          {/* Headline */}

          <h2
            className="
              text-5xl
              font-black
              leading-[0.92]
              tracking-[-0.065em]
              text-white
              drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]
              sm:text-6xl
              md:text-7xl
              lg:text-[82px]
            "
          >
            From question
            <span
              className="
                mx-2
                text-primary
                sm:mx-3
              "
            >
              →
            </span>
            evidence.
          </h2>

          {/* Short explanation */}

          <p
            className="
              relative
              z-20
              mx-auto
              mt-6
              max-w-2xl
              !text-[#D4D4D8]
              text-semibold
              font-medium
              leading-6
              drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]
              sm:text-base
              sm:leading-7
            "
          >
            Dasaiko turns a question into focused research —
            then shows you where the answer came from.
          </p>
        </div>

        {/* ====================================================
            PIPELINE CONTAINER
        ===================================================== */}

        <div
          ref={pipelineRef}
          className="
            relative
            mx-auto
            mt-14
            max-w-6xl
            overflow-hidden
            rounded-[30px]
            border-2
            border-white/[0.13]
            bg-[#060609]
            shadow-[0_35px_120px_rgba(0,0,0,0.55)]
            sm:mt-16
          "
        >
          {/* ==================================================
              BACKGROUND BEAMS

              Atmospheric only.
              They do NOT represent the actual research path.
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-55
            "
            aria-hidden="true"
          >
            <Beams
              beamWidth={1.1}
              beamHeight={8}
              beamNumber={5}
              lightColor="#8b5cf6"
              speed={0.28}
              noiseIntensity={0.38}
              scale={0.12}
              rotation={7}
            />
          </div>

          {/* ==================================================
              ATMOSPHERIC OVERLAY
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(109,65,210,0.14),transparent_68%),linear-gradient(to_bottom,rgba(6,6,9,0.10),rgba(6,6,9,0.70))]
            "
          />

          {/* ==================================================
              TOP / BOTTOM VIGNETTE
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-20
              h-20
              bg-gradient-to-b
              from-[#060609]
              to-transparent
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              z-20
              h-24
              bg-gradient-to-t
              from-[#060609]
              to-transparent
            "
          />

          {/* ==================================================
              TOP BAR
          =================================================== */}

          <div
            className="
              relative
              z-30
              flex
              items-center
              justify-between
              border-b-2
              border-white/[0.07]
              px-5
              py-4
              sm:px-8
              sm:py-5
            "
          >
            {/* Dasaiko */}

            <div
              className="
                flex
                items-center
                gap-2.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.20em]
                text-zinc-200
              "
            >
              <span
                className="
                  relative
                  flex
                  h-2
                  w-2
                "
              >
                <span
                  className="
                    absolute
                    inset-0
                    animate-ping
                    rounded-full
                    bg-primary
                    opacity-50
                  "
                />

                <span
                  className="
                    relative
                    h-2
                    w-2
                    rounded-full
                    bg-primary
                    shadow-[0_0_12px_rgba(139,92,246,0.6)]
                  "
                />
              </span>

              Dasaiko
            </div>

            {/* Live status */}

            <div
              className="
                flex
                items-center
                gap-2
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-zinc-400
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_8px_rgba(52,211,153,0.45)]
                "
              />

              Live research
            </div>
          </div>

          {/* ==================================================
              PIPELINE CONTENT
          =================================================== */}

          <div
            className="
              relative
              z-10
              px-5
              pb-8
              pt-10
              sm:px-10
              sm:pb-10
              sm:pt-12
              lg:px-14
              lg:pb-12
              lg:pt-14
            "
          >
            {/* =================================================
                STAGE NODES
            ================================================== */}

            <div
              className="
                relative
                mx-auto
                max-w-4xl
              "
            >
              {/* =================================================
                  FIXED PATH

                  This is intentionally NOT animated.
                  It provides a clear visual backbone.
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-[12.5%]
                  right-[12.5%]
                  top-[30px]
                  h-[2px]
                  rounded-full
                  bg-white/[0.14]
                "
              />

              {/* =================================================
                  COMPLETED PATH
              ================================================== */}

              {[0, 1, 2].map((segment) => (
                <div
                  key={segment}
                  className={`
                    pointer-events-none
                    absolute
                    top-[30px]
                    h-[2px]
                    w-[25%]
                    rounded-full
                    transition-all
                    duration-700
                    ease-out
                    ${
                      segment < activeStage
                        ? "bg-primary/75 shadow-[0_0_10px_rgba(139,92,246,0.28)]"
                        : "bg-transparent"
                    }
                  `}
                  style={{
                    left: `${12.5 + segment * 25}%`,
                  }}
                />
              ))}

              {/* =================================================
                  STAGES
              ================================================== */}

              <div
                className="
                  relative
                  flex
                  items-start
                  justify-between
                "
              >
                {stages.map((item, index) => {
                  const Icon = item.icon;

                  const active =
                    activeStage === index;

                  const complete =
                    index < activeStage;

                  return (
                    <div
                      key={item.title}
                      className="
                        relative
                        z-10
                        flex
                        w-1/4
                        flex-col
                        items-center
                      "
                    >
                      {/* =========================================
                          NODE
                      ========================================== */}

                      <div
                        className={`
                          flex
                          h-[60px]
                          w-[60px]
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          transition-all
                          duration-500
                          ${
                            active
                              ? "border-white bg-white text-[#17121f] shadow-[0_0_0_6px_rgba(139,92,246,0.10),0_0_28px_rgba(139,92,246,0.34)]"
                              : complete
                                ? "border-primary/35 bg-primary/[0.08] text-primary/75"
                                : "border-white/[0.12] bg-[#09090d] text-zinc-600"
                          }
                        `}
                      >
                        {complete ? (
                          <Check
                            className="h-5 w-5"
                            strokeWidth={2.6}
                          />
                        ) : (
                          <Icon
                            className="h-5 w-5"
                            strokeWidth={2.2}
                          />
                        )}
                      </div>

                      {/* =========================================
                          STAGE LABEL
                      ========================================== */}

                      <div className="mt-4 text-center">
                        <div
                          className={`
                            whitespace-nowrap
                            text-sm
                            font-bold
                            tracking-[-0.02em]
                            transition-colors
                            duration-500
                            ${
                              active
                                ? "text-white"
                                : complete
                                  ? "text-zinc-400"
                                  : "text-zinc-600"
                            }
                          `}
                        >
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                ACTIVE RESEARCH DATA
            ================================================== */}

            <div
              ref={contentRef}
              className="
                relative
                mx-auto
                mt-10
                max-w-4xl
              "
            >
              {/* Ambient card glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -inset-4
                  rounded-[28px]
                  bg-primary/[0.06]
                  blur-3xl
                "
              />

              {/* Main card */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[22px]
                  border-2
                  border-white/[0.14]
                  bg-black/70
                  px-5
                  py-5
                  backdrop-blur-xl
                  sm:px-7
                  sm:py-6
                "
              >
                {/* Top accent */}

                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-[2px]
                    w-24
                    bg-gradient-to-r
                    from-primary
                    to-transparent
                  "
                />

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
                  {/* Main data */}

                  <div className="min-w-0">
                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.20em]
                        text-primary
                      "
                    >
                      <ActiveIcon className="h-3.5 w-3.5" />

                      {stage.eyebrow}
                    </div>

                    <div
                      className="
                        mt-2.5
                        text-base
                        font-bold
                        leading-6
                        tracking-[-0.02em]
                        text-white
                        sm:text-lg
                        sm:leading-7
                      "
                    >
                      {stage.value}
                    </div>
                  </div>

                  {/* Metadata */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-2.5
                      self-start
                      rounded-full
                      border
                      border-white/[0.10]
                      bg-white/[0.035]
                      px-4
                      py-2.5
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-zinc-300
                      sm:self-center
                    "
                  >
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-emerald-400
                        shadow-[0_0_8px_rgba(52,211,153,0.45)]
                      "
                    />

                    {stage.meta}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              BOTTOM PRINCIPLE
          =================================================== */}

          <div
            className="
              relative
              z-30
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
              border-t-2
              border-white/[0.07]
              px-5
              py-4
              sm:py-5
            "
          >
            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-zinc-500
              "
            >
              Every step leaves a trace
            </span>

            <ArrowRight
              className="
                h-3
                w-3
                text-primary/60
              "
            />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              Every answer has evidence
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          BOTTOM SECTION FADE
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-28
          bg-gradient-to-t
          from-base
          to-transparent
        "
      />
    </section>
  );
}

export default ResearchFlow;