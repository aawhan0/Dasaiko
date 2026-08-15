import { useEffect, useRef, useState } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import InfiniteMenu from "@/components/InfiniteMenu";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   MINIMAL RESEARCH VISUALS
============================================================ */

const createVisual = (content: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 800"
      fill="none"
    >
      <rect
        width="800"
        height="800"
        rx="56"
        fill="#08080C"
      />

      <rect
        x="32"
        y="32"
        width="736"
        height="736"
        rx="42"
        stroke="#25212E"
        stroke-width="3"
      />

      ${content}
    </svg>
  `)}`;

/* ============================================================
   KNOWLEDGE BASE
============================================================ */

const knowledgeVisual = createVisual(`
  <circle
    cx="400"
    cy="400"
    r="190"
    fill="#100C18"
    stroke="#7C3AED"
    stroke-width="6"
  />

  <circle
    cx="400"
    cy="400"
    r="72"
    fill="#8B5CF6"
  />

  <circle
    cx="400"
    cy="400"
    r="28"
    fill="#08080C"
  />

  <circle
    cx="230"
    cy="280"
    r="42"
    fill="#15101E"
    stroke="#5B3FA3"
    stroke-width="5"
  />

  <circle
    cx="570"
    cy="280"
    r="42"
    fill="#15101E"
    stroke="#5B3FA3"
    stroke-width="5"
  />

  <circle
    cx="230"
    cy="520"
    r="42"
    fill="#15101E"
    stroke="#5B3FA3"
    stroke-width="5"
  />

  <circle
    cx="570"
    cy="520"
    r="42"
    fill="#15101E"
    stroke="#5B3FA3"
    stroke-width="5"
  />

  <path
    d="M264 308L345 366"
    stroke="#8B5CF6"
    stroke-width="7"
  />

  <path
    d="M536 308L455 366"
    stroke="#8B5CF6"
    stroke-width="7"
  />

  <path
    d="M264 492L345 434"
    stroke="#8B5CF6"
    stroke-width="7"
  />

  <path
    d="M536 492L455 434"
    stroke="#8B5CF6"
    stroke-width="7"
  />
`);

/* ============================================================
   BOOKS & PAPERS
============================================================ */

const booksVisual = createVisual(`
  <path
    d="
      M400 210
      C325 170 235 175 160 215
      V600
      C235 565 325 570 400 620
      V210Z
    "
    fill="#0F0D15"
    stroke="#8B5CF6"
    stroke-width="7"
  />

  <path
    d="
      M400 210
      C475 170 565 175 640 215
      V600
      C565 565 475 570 400 620
      V210Z
    "
    fill="#0F0D15"
    stroke="#8B5CF6"
    stroke-width="7"
  />

  <path
    d="M220 285H340"
    stroke="#F5F5F5"
    stroke-width="14"
    stroke-linecap="round"
  />

  <path
    d="M460 285H580"
    stroke="#F5F5F5"
    stroke-width="14"
    stroke-linecap="round"
  />

  <path
    d="M220 340H325"
    stroke="#494253"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M475 340H580"
    stroke="#494253"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M220 390H340"
    stroke="#494253"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M460 390H580"
    stroke="#494253"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M400 210V620"
    stroke="#7C3AED"
    stroke-width="5"
  />
`);

/* ============================================================
   LECTURE NOTES
============================================================ */

const notesVisual = createVisual(`
  <rect
    x="175"
    y="125"
    width="450"
    height="550"
    rx="28"
    fill="#0F0D15"
    stroke="#7C3AED"
    stroke-width="7"
  />

  <path
    d="M245 235H555"
    stroke="#F5F5F5"
    stroke-width="16"
    stroke-linecap="round"
  />

  <path
    d="M245 290H510"
    stroke="#484152"
    stroke-width="11"
    stroke-linecap="round"
  />

  <path
    d="M245 345H550"
    stroke="#484152"
    stroke-width="11"
    stroke-linecap="round"
  />

  <path
    d="M245 400H500"
    stroke="#484152"
    stroke-width="11"
    stroke-linecap="round"
  />

  <rect
    x="245"
    y="470"
    width="145"
    height="115"
    rx="16"
    fill="#18131F"
    stroke="#5B43A8"
    stroke-width="5"
  />

  <circle
    cx="318"
    cy="527"
    r="25"
    fill="#8B5CF6"
  />

  <path
    d="M440 505H550"
    stroke="#8B5CF6"
    stroke-width="11"
    stroke-linecap="round"
  />

  <path
    d="M440 550H525"
    stroke="#484152"
    stroke-width="11"
    stroke-linecap="round"
  />
`);

/* ============================================================
   RESEARCH PAPERS
============================================================ */

const papersVisual = createVisual(`
  <rect
    x="170"
    y="100"
    width="460"
    height="610"
    rx="24"
    fill="#0F0D17"
    stroke="#8B5CF6"
    stroke-width="7"
  />

  <path
    d="M240 215H560"
    stroke="#F5F5F5"
    stroke-width="18"
    stroke-linecap="round"
  />

  <path
    d="M240 270H525"
    stroke="#5C5567"
    stroke-width="11"
    stroke-linecap="round"
  />

  <path
    d="M240 350H560"
    stroke="#3B3547"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M240 400H515"
    stroke="#3B3547"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M240 450H545"
    stroke="#3B3547"
    stroke-width="10"
    stroke-linecap="round"
  />

  <path
    d="M240 500H495"
    stroke="#3B3547"
    stroke-width="10"
    stroke-linecap="round"
  />

  <circle
    cx="560"
    cy="610"
    r="48"
    fill="#8B5CF6"
  />

  <path
    d="M535 610L553 628L588 587"
    stroke="#09080D"
    stroke-width="12"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
`);

/* ============================================================
   TECHNICAL NOTES
============================================================ */

const technicalVisual = createVisual(`
  <rect
    x="125"
    y="125"
    width="550"
    height="550"
    rx="30"
    fill="#0C0B11"
    stroke="#7C3AED"
    stroke-width="7"
  />

  <circle
    cx="180"
    cy="185"
    r="9"
    fill="#8B5CF6"
  />

  <circle
    cx="212"
    cy="185"
    r="9"
    fill="#494253"
  />

  <circle
    cx="244"
    cy="185"
    r="9"
    fill="#494253"
  />

  <path
    d="M195 310L255 365L195 420"
    stroke="#F5F5F5"
    stroke-width="18"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <path
    d="M305 420H520"
    stroke="#8B5CF6"
    stroke-width="16"
    stroke-linecap="round"
  />

  <path
    d="M195 500H600"
    stroke="#3E3849"
    stroke-width="12"
    stroke-linecap="round"
  />

  <path
    d="M195 550H560"
    stroke="#3E3849"
    stroke-width="12"
    stroke-linecap="round"
  />

  <path
    d="M195 600H500"
    stroke="#3E3849"
    stroke-width="12"
    stroke-linecap="round"
  />
`);

/* ============================================================
   SCIENCE / MEDICAL
============================================================ */

const scienceVisual = createVisual(`
  <circle
    cx="400"
    cy="400"
    r="180"
    fill="#0D0B15"
    stroke="#7C3AED"
    stroke-width="7"
  />

  <ellipse
    cx="400"
    cy="400"
    rx="220"
    ry="80"
    stroke="#5B3FA3"
    stroke-width="6"
    transform="rotate(30 400 400)"
  />

  <ellipse
    cx="400"
    cy="400"
    rx="220"
    ry="80"
    stroke="#5B3FA3"
    stroke-width="6"
    transform="rotate(-30 400 400)"
  />

  <ellipse
    cx="400"
    cy="400"
    rx="220"
    ry="80"
    stroke="#5B3FA3"
    stroke-width="6"
  />

  <circle
    cx="400"
    cy="400"
    r="58"
    fill="#8B5CF6"
  />

  <circle
    cx="400"
    cy="400"
    r="22"
    fill="#09080D"
  />

  <circle
    cx="575"
    cy="300"
    r="15"
    fill="#F5F5F5"
  />

  <circle
    cx="230"
    cy="500"
    r="15"
    fill="#F5F5F5"
  />
`);

/* ============================================================
   RESEARCH ITEMS
============================================================ */

const researchItems = [
  {
    image: knowledgeVisual,
    link: "",
    title: "",
    description: "Your personal research foundation.",
  },
  {
    image: booksVisual,
    link: "",
    title: "",
    description: "Long-form knowledge and foundational texts.",
  },
  {
    image: notesVisual,
    link: "",
    title: "",
    description: "Study material, organized for reference.",
  },
  {
    image: papersVisual,
    link: "",
    title: "",
    description: "Peer-reviewed research and evidence.",
  },
  {
    image: technicalVisual,
    link: "",
    title: "",
    description: "Technical documentation and deep dives.",
  },
  {
    image: scienceVisual,
    link: "",
    title: "",
    description: "Specialized medical knowledge and sources.",
  },
];

/* ============================================================
   RESEARCH UNIVERSE
============================================================ */

export function ResearchUniverse() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [hasInteracted, setHasInteracted] = useState(false);

  /* ==========================================================
     SECTION ENTRANCE + MENU WAKE-UP
  ========================================================== */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const context = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          {
            y: 34,
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
          }
        );
      }

      if (menuRef.current) {
        const menu = menuRef.current;

        const entrance = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        });

        entrance
          .set(menu, {
            opacity: 0,
            y: 40,
            scale: 0.975,
          })
          .to(menu, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
          })
          /*
           * Small controlled movement.
           *
           * This is deliberately subtle.
           * The goal is to make the user notice
           * that the gallery is alive.
           */
          .to(menu, {
            x: -12,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(menu, {
            x: 10,
            duration: 0.65,
            ease: "power2.inOut",
          })
          .to(menu, {
            x: 0,
            duration: 0.45,
            ease: "power3.out",
          });
      }
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  /* ==========================================================
     DETECT USER INTERACTION
  ========================================================== */

  useEffect(() => {
    const menu = menuRef.current;

    if (!menu) return;

    const handleInteraction = () => {
      setHasInteracted(true);
    };

    menu.addEventListener(
      "pointerdown",
      handleInteraction
    );

    menu.addEventListener(
      "wheel",
      handleInteraction,
      { passive: true }
    );

    menu.addEventListener(
      "touchstart",
      handleInteraction,
      { passive: true }
    );

    return () => {
      menu.removeEventListener(
        "pointerdown",
        handleInteraction
      );

      menu.removeEventListener(
        "wheel",
        handleInteraction
      );

      menu.removeEventListener(
        "touchstart",
        handleInteraction
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="research-universe"
      className="
        relative
        overflow-hidden
        bg-base
        py-20
        sm:py-24
        md:py-28
      "
    >
      {/* ======================================================
          SECTION ATMOSPHERE
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[620px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.055]
          blur-[170px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.018]
          [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)]
          [background-size:80px_80px]
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
            HEADER
        ===================================================== */}

        <div
          ref={headingRef}
          className="
            mx-auto
            max-w-5xl
            text-center
          "
        >
          <div
            className="
              mb-4
              inline-flex
              items-center
              gap-2.5
              rounded-full
              border
              border-primary/20
              bg-black/35
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

            Research universe
          </div>

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
            Your knowledge,
            <br />

            <span className="text-zinc-500">
              connected.
            </span>
          </h2>

         <p
            className="
                relative
                z-20
                mx-auto
                mt-6
                max-w-xl
                !text-[#D4D4D8]
                text-sm
                font-semibold
                leading-6
                drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]
                sm:text-base
            "
            >
            One place for the sources behind your research.
            </p>
        </div>

        {/* ====================================================
            INFINITE MENU
        ===================================================== */}

        <div
          ref={menuRef}
          className="
            relative
            mx-auto
            mt-12
            h-[430px]
            w-full
            max-w-6xl
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.13]
            bg-[#060609]
            shadow-[0_35px_120px_rgba(0,0,0,0.55)]
            sm:mt-14
            sm:h-[500px]
            md:h-[540px]
          "
        >
          {/* ==================================================
              TOP ACCENT
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-0
              z-30
              h-[2px]
              w-[32%]
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-primary
              to-transparent
              opacity-80
            "
          />

          {/* ==================================================
              INITIAL ATTENTION SWEEP
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              -left-1/3
              z-30
              w-1/3
              skew-x-[-12deg]
              bg-gradient-to-r
              from-transparent
              via-primary/[0.10]
              to-transparent
              animate-[researchSweep_2.2s_ease-out_1s_1_forwards]
            "
          />

          {/* ==================================================
              CENTER ATMOSPHERE
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              z-0
              h-[340px]
              w-[340px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-primary/[0.075]
              blur-[110px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              z-0
              h-[180px]
              w-[180px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-primary/[0.08]
            "
          />

          {/* ==================================================
              INFINITE MENU
          =================================================== */}

          <div
            className="
              relative
              z-10
              h-full
              w-full
            "
          >
            <InfiniteMenu
              items={researchItems}
              scale={1.12}
            />
          </div>

          {/* ==================================================
              EDGE VIGNETTES
          =================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-0
              z-20
              w-16
              bg-gradient-to-r
              from-[#060609]
              via-[#060609]/75
              to-transparent
              sm:w-28
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-0
              z-20
              w-16
              bg-gradient-to-l
              from-[#060609]
              via-[#060609]/75
              to-transparent
              sm:w-28
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
              via-[#060609]/35
              to-transparent
            "
          />

          {/* ==================================================
              TEMPORARY INTERACTION PROMPT
          =================================================== */}

          {!hasInteracted && (
            <div
              className="
                pointer-events-none
                absolute
                bottom-7
                left-1/2
                z-40
                -translate-x-1/2
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  rounded-full
                  border
                  border-white/[0.12]
                  bg-black/70
                  px-4
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-zinc-200
                  shadow-[0_10px_40px_rgba(0,0,0,0.45)]
                  backdrop-blur-xl
                "
              >
                <MoveHorizontal
                  className="
                    h-3.5
                    w-3.5
                    animate-pulse
                    text-primary
                  "
                />

                <span>
                  Drag to explore
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          SECTION BOTTOM FADE
      ======================================================= */}

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
      />
    </section>
  );
}

export default ResearchUniverse;