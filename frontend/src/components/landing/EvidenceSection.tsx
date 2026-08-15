import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  FileText,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import TiltedCard from "@/components/TiltedCard";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   EVIDENCE DOCUMENT
============================================================ */

const evidenceDocument =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="820"
      viewBox="0 0 1200 820"
    >
      <defs>
        <linearGradient
          id="bg"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stop-color="#09090d"/>
          <stop offset="55%" stop-color="#0c0b13"/>
          <stop offset="100%" stop-color="#09090d"/>
        </linearGradient>

        <linearGradient
          id="purple"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0%" stop-color="#7c3aed"/>
          <stop offset="50%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>

        <filter
          id="glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="18"
            result="blur"
          />
        </filter>
      </defs>

      <!-- Background -->
      <rect
        width="1200"
        height="820"
        rx="34"
        fill="url(#bg)"
      />

      <!-- Ambient glow -->
      <ellipse
        cx="650"
        cy="650"
        rx="390"
        ry="190"
        fill="#7c3aed"
        opacity=".10"
        filter="url(#glow)"
      />

      <!-- Document frame -->
      <rect
        x="55"
        y="45"
        width="1090"
        height="730"
        rx="24"
        fill="#0d0d13"
        stroke="#302b3d"
        stroke-width="3"
      />

      <!-- Header -->
      <rect
        x="90"
        y="82"
        width="1020"
        height="84"
        rx="14"
        fill="#111118"
        stroke="#24212e"
        stroke-width="2"
      />

      <!-- Document icon -->
      <rect
        x="115"
        y="105"
        width="36"
        height="36"
        rx="9"
        fill="#7c3aed"
        opacity=".16"
        stroke="#8b5cf6"
        stroke-width="2"
      />

      <path
        d="M127 114h12v18h-12z"
        fill="none"
        stroke="#a78bfa"
        stroke-width="2"
      />

      <!-- Header text -->
      <rect
        x="172"
        y="105"
        width="210"
        height="12"
        rx="6"
        fill="#f4f4f5"
        opacity=".92"
      />

      <rect
        x="172"
        y="128"
        width="150"
        height="8"
        rx="4"
        fill="#71717a"
      />

      <!-- Verified -->
      <rect
        x="965"
        y="105"
        width="112"
        height="34"
        rx="17"
        fill="#34d399"
        opacity=".08"
        stroke="#34d399"
        stroke-width="2"
      />

      <circle
        cx="987"
        cy="122"
        r="5"
        fill="#34d399"
      />

      <rect
        x="1001"
        y="117"
        width="55"
        height="10"
        rx="5"
        fill="#6ee7b7"
        opacity=".85"
      />

      <!-- Document title -->
      <rect
        x="115"
        y="215"
        width="410"
        height="22"
        rx="11"
        fill="#f4f4f5"
        opacity=".95"
      />

      <rect
        x="115"
        y="252"
        width="240"
        height="9"
        rx="4.5"
        fill="#71717a"
      />

      <!-- Body -->
      <rect
        x="115"
        y="310"
        width="960"
        height="10"
        rx="5"
        fill="#3f3f46"
      />

      <rect
        x="115"
        y="340"
        width="900"
        height="10"
        rx="5"
        fill="#3f3f46"
      />

      <rect
        x="115"
        y="370"
        width="930"
        height="10"
        rx="5"
        fill="#3f3f46"
      />

      <!-- Evidence highlight -->
      <rect
        x="115"
        y="425"
        width="970"
        height="105"
        rx="16"
        fill="#7c3aed"
        opacity=".11"
        stroke="#8b5cf6"
        stroke-width="2"
      />

      <rect
        x="115"
        y="425"
        width="7"
        height="105"
        rx="3.5"
        fill="url(#purple)"
      />

      <rect
        x="145"
        y="452"
        width="820"
        height="11"
        rx="5.5"
        fill="#ddd6fe"
        opacity=".95"
      />

      <rect
        x="145"
        y="480"
        width="735"
        height="11"
        rx="5.5"
        fill="#a78bfa"
        opacity=".72"
      />

      <!-- Supporting passage -->
      <rect
        x="115"
        y="565"
        width="970"
        height="110"
        rx="16"
        fill="#101019"
        stroke="#29243a"
        stroke-width="2"
      />

      <rect
        x="145"
        y="592"
        width="180"
        height="10"
        rx="5"
        fill="#a78bfa"
        opacity=".9"
      />

      <rect
        x="145"
        y="620"
        width="820"
        height="9"
        rx="4.5"
        fill="#52525b"
      />

      <rect
        x="145"
        y="646"
        width="690"
        height="9"
        rx="4.5"
        fill="#52525b"
      />

      <!-- Page indicator -->
      <rect
        x="930"
        y="700"
        width="145"
        height="8"
        rx="4"
        fill="#52525b"
        opacity=".7"
      />

      <!-- Verification indicator -->
      <circle
        cx="1070"
        cy="215"
        r="8"
        fill="#34d399"
      />
    </svg>
  `);

export function EvidenceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ==========================================================
     SCROLL ANIMATION
  ========================================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        {
          y: 38,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        contentRef.current,
        {
          y: 45,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 66%",
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
      id="evidence"
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
          TOP TRANSITION
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-0
          h-48
          bg-gradient-to-b
          from-base
          via-base/70
          to-transparent
        "
        aria-hidden="true"
      />

      {/* ======================================================
          AMBIENT PURPLE GLOW
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[52%]
          z-0
          h-[520px]
          w-[720px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.045]
          blur-[170px]
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
          {/* Eyebrow */}

          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary/30
              bg-primary/[0.06]
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
            <ShieldCheck className="h-3.5 w-3.5" />

            Evidence first
          </div>

          {/* Main heading */}

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
              lg:text-[78px]
            "
          >
            <span className="text-white">
              Don&apos;t trust the answer.
            </span>

            <br />

            <span className="text-zinc-300">
              Verify it.
            </span>
          </h2>

          {/* Subtitle */}

          <p
            className="
              relative
              z-20
              mx-auto
              mt-7
              max-w-2xl
              !text-zinc-300
              text-sm
              font-semibold
              leading-7
              drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]
              sm:text-base
            "
          >
            Every important claim should have somewhere to go.
            Dasaiko keeps the supporting passage, source document,
            and page context close to the answer.
          </p>
        </div>

        {/* ====================================================
            MAIN CONTENT
        ===================================================== */}

        <div
          ref={contentRef}
          className="
            mt-16
            grid
            items-center
            gap-14
            lg:grid-cols-[0.78fr_1.22fr]
            lg:gap-16
          "
        >
          {/* ==================================================
              LEFT — EXPLANATION
          =================================================== */}

          <div className="max-w-lg">
            {/* Product signal */}

            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2.5
                rounded-full
                border
                border-primary/25
                bg-primary/[0.045]
                px-3.5
                py-2
              "
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-zinc-300
                "
              >
                Grounded generation
              </span>
            </div>

            {/* Explanation */}

            <h3
              className="
                max-w-md
                text-3xl
                font-black
                leading-[1.05]
                tracking-[-0.045em]
                text-white
                sm:text-4xl
              "
            >
              Your answer shouldn&apos;t
              <span className="text-zinc-400">
                {" "}
                become a dead end.
              </span>
            </h3>

            <p
              className="
                mt-6
                max-w-md
                !text-zinc-300
                text-sm
                font-medium
                leading-7
                sm:text-base
              "
            >
              Dasaiko keeps the relationship between a generated
              response and the information that supports it visible.
              When you want to go deeper, follow the evidence back
              to the document.
            </p>

            {/* Key capabilities */}

            <div className="mt-8 space-y-3">
              {[
                "Source document attached",
                "Page-level context",
                "Evidence connected to the response",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.035]
                    px-4
                    py-3
                  "
                >
                  <CheckCircle2
                    className="
                      h-4
                      w-4
                      shrink-0
                      text-emerald-400
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-semibold
                      text-zinc-300
                    "
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================
              RIGHT — SINGLE EVIDENCE DOCUMENT
          =================================================== */}

          <div
            className="
              flex
              min-h-[500px]
              items-center
              justify-center
            "
          >
            <TiltedCard
              imageSrc={evidenceDocument}
              altText="Dasaiko evidence document showing a verified supporting passage"
              captionText="Attention Is All You Need — p.4"
              containerHeight="430px"
              containerWidth="100%"
              imageHeight="430px"
              imageWidth="min(100%, 680px)"
              scaleOnHover={1.025}
              rotateAmplitude={4}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={false}
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          BOTTOM TRANSITION
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          z-20
          h-36
          bg-gradient-to-b
          from-transparent
          via-base/45
          to-base
        "
        aria-hidden="true"
      />
    </section>
  );
}