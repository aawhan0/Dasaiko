import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  FileSearch,
  Layers3,
  Network,
  Search,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Research Contexts",
    description:
      "Keep papers, conversations, and research intent connected inside a persistent workspace.",
    icon: Layers3,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Deep Retrieval",
    description:
      "Search across your documents using semantic and lexical retrieval.",
    icon: Search,
    className: "md:col-span-1",
  },
  {
    title: "Evidence Cards",
    description:
      "Jump from an answer directly to the supporting passage.",
    icon: FileSearch,
    className: "md:col-span-1",
  },
  {
    title: "Paper Selection",
    description:
      "Keep important papers in context while your research evolves.",
    icon: BookOpen,
    className: "md:col-span-1",
  },
  {
    title: "Research Intelligence",
    description:
      "Transform natural questions into focused retrieval strategies.",
    icon: Brain,
    className: "md:col-span-2",
  },
];

export function FeatureBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      /* =====================================================
          HEADING
      ====================================================== */

      gsap.fromTo(
        headingRef.current,
        {
          y: 35,
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

      /* =====================================================
          CARDS
      ====================================================== */

      const cards = gridRef.current?.querySelectorAll(
        "[data-feature-card]",
      );

      if (cards?.length) {
        gsap.fromTo(
          cards,
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 75%",
              once: true,
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="
        relative
        overflow-hidden
        bg-base
        py-24
        sm:py-32
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[520px]
          w-[520px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.025]
          blur-[150px]
        "
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          ref={headingRef}
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          {/* LABEL */}

          <div
            className="
              mb-7
              inline-flex
              items-center
              gap-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-zinc-300
            "
          >
            <Network
              className="
                h-3.5
                w-3.5
                text-primary
              "
            />

            <span>
              Built for serious research
            </span>
          </div>

          {/* HEADLINE */}

          <h2
            className="
              text-5xl
              font-black
              leading-[0.9]
              tracking-[-0.065em]
              text-white
              sm:text-6xl
              md:text-7xl
              lg:text-[82px]
            "
          >
            Less searching.
            <br />

            <span
              className="
                font-black
                text-zinc-500
              "
            >
              More understanding.
            </span>
          </h2>

          {/* SUBTITLE */}

          <p
            className="
              relative
              z-20
              mx-auto
              mt-7
              max-w-2xl
              text-sm
              font-semibold
              leading-7
              !text-zinc-300
              opacity-100
              sm:text-base
              md:text-[17px]
            "
          >
            Dasaiko brings the pieces of document research
            together so you can spend more time thinking
            about the material.
          </p>
        </div>

        {/* =================================================
            BENTO GRID
        ================================================== */}

        <div
          ref={gridRef}
          className="
            mt-16
            grid
            auto-rows-[230px]
            gap-4
            md:grid-cols-3
          "
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===========================================================
   FEATURE CARD
=========================================================== */

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <div
      data-feature-card
      className={`
        group
        relative
        overflow-hidden
        rounded-[26px]

        border-[1.5px]
        border-white/[0.13]

        bg-white/[0.025]

        p-7

        transition-all
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]

        hover:-translate-y-1
        hover:border-white
        hover:bg-white
        hover:shadow-[0_28px_80px_rgba(255,255,255,0.10)]

        ${feature.className}
      `}
    >
      {/* =================================================
          LARGE NUMBER
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-5
          top-3

          text-[76px]
          font-black
          leading-none
          tracking-[-0.09em]

          text-white/[0.035]

          transition-all
          duration-500

          group-hover:text-black/[0.045]
          group-hover:scale-105
        "
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* =================================================
          ICON
      ================================================== */}

      <div
        className="
          relative
          z-10

          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-[14px]

          border-[1.5px]
          border-white/[0.14]

          bg-white/[0.035]

          text-zinc-100

          transition-all
          duration-500

          group-hover:border-black
          group-hover:bg-black
          group-hover:text-white

          group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]
        "
      >
        <Icon
          className="
            h-[20px]
            w-[20px]

            stroke-[2]

            transition-transform
            duration-500

            group-hover:scale-110
          "
        />
      </div>

      {/* =================================================
          CONTENT
      ================================================== */}

      <div
        className="
          relative
          z-10
          mt-8
          max-w-[620px]
        "
      >
        <h3
          className="
            text-[20px]
            font-extrabold
            leading-tight
            tracking-[-0.035em]

            text-white

            transition-colors
            duration-500

            group-hover:text-black

            sm:text-[21px]
          "
        >
          {feature.title}
        </h3>

        <p
          className="
            mt-3.5

            max-w-[560px]

            text-[14px]
            font-semibold
            leading-6

            !text-zinc-400
            opacity-100

            transition-colors
            duration-500

            group-hover:!text-zinc-700
          "
        >
          {feature.description}
        </p>
      </div>

      {/* =================================================
          VISUAL
      ================================================== */}

      <FeatureVisual index={index} />

      {/* =================================================
          ARROW
      ================================================== */}

      <div
        className="
          absolute
          bottom-6
          right-6

          flex
          h-10
          w-10
          items-center
          justify-center

          rounded-full

          border-[1.5px]
          border-white/[0.12]

          bg-white/[0.025]

          text-zinc-500

          transition-all
          duration-500

          group-hover:border-black
          group-hover:bg-black
          group-hover:text-white
        "
      >
        <ArrowUpRight
          className="
            h-[17px]
            w-[17px]

            transition-transform
            duration-300

            group-hover:translate-x-0.5
            group-hover:-translate-y-0.5
          "
        />
      </div>

      {/* =================================================
          BOTTOM ACCENT
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-7
          right-7
          h-[1.5px]

          bg-transparent

          transition-colors
          duration-500

          group-hover:bg-black/10
        "
      />
    </div>
  );
}

/* ===========================================================
   FEATURE VISUALS
=========================================================== */

function FeatureVisual({
  index,
}: {
  index: number;
}) {
  /* =======================================================
      RESEARCH CONTEXTS
  ======================================================= */

  if (index === 0) {
    return (
      <div
        className="
          pointer-events-none
          absolute
          bottom-[-24px]
          right-[-5px]

          h-48
          w-72

          opacity-60

          transition-all
          duration-700

          group-hover:scale-105
          group-hover:opacity-75
        "
      >
        <div
          className="
            absolute
            right-16
            top-4

            h-28
            w-44

            rotate-[-8deg]

            rounded-2xl

            border-[1.5px]
            border-primary/[0.10]

            bg-primary/[0.025]

            transition-all
            duration-500

            group-hover:border-black/[0.08]
            group-hover:bg-black/[0.025]
          "
        />

        <div
          className="
            absolute
            right-3
            top-12

            h-28
            w-44

            rotate-[5deg]

            rounded-2xl

            border-[1.5px]
            border-white/[0.07]

            bg-white/[0.018]

            transition-all
            duration-500

            group-hover:border-black/[0.08]
            group-hover:bg-black/[0.02]
          "
        />

        <div
          className="
            absolute
            bottom-3
            right-20

            h-24
            w-36

            rounded-2xl

            border-[1.5px]
            border-primary/[0.15]

            bg-[#0d0d12]

            shadow-[0_20px_60px_rgba(0,0,0,0.4)]

            transition-all
            duration-500

            group-hover:border-black/[0.12]
            group-hover:bg-zinc-100
          "
        >
          <div className="space-y-2.5 p-4">
            <div
              className="
                h-1.5
                w-20
                rounded-full
                bg-primary/30

                transition-colors
                duration-500

                group-hover:bg-black/20
              "
            />

            <div
              className="
                h-1
                w-28
                rounded-full
                bg-white/[0.08]

                transition-colors
                duration-500

                group-hover:bg-black/10
              "
            />

            <div
              className="
                h-1
                w-24
                rounded-full
                bg-white/[0.06]

                transition-colors
                duration-500

                group-hover:bg-black/[0.08]
              "
            />

            <div
              className="
                h-1
                w-16
                rounded-full
                bg-white/[0.04]

                transition-colors
                duration-500

                group-hover:bg-black/[0.06]
              "
            />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
      DEEP RETRIEVAL
  ======================================================= */

  if (index === 1) {
    return (
      <div
        className="
          pointer-events-none
          absolute
          bottom-7
          right-7

          opacity-60

          transition-opacity
          duration-500

          group-hover:opacity-80
        "
      >
        <div className="flex items-end gap-1.5">
          {[35, 58, 44, 76, 52, 88, 65].map(
            (height, i) => (
              <div
                key={i}
                className="
                  w-1.5
                  rounded-full

                  bg-primary/30

                  transition-all
                  duration-500

                  group-hover:bg-black/20
                "
                style={{
                  height,
                }}
              />
            ),
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
      EVIDENCE
  ======================================================= */

  if (index === 2) {
    return (
      <div
        className="
          pointer-events-none
          absolute
          bottom-7
          right-7

          flex
          items-center
          gap-2

          opacity-60

          transition-opacity
          duration-500

          group-hover:opacity-80
        "
      >
        <div
          className="
            h-2.5
            w-2.5
            rounded-full
            bg-emerald-400/70

            transition-colors
            duration-500

            group-hover:bg-black
          "
        />

        <div
          className="
            h-[1.5px]
            w-12
            bg-emerald-400/25

            transition-colors
            duration-500

            group-hover:bg-black/20
          "
        />

        <div
          className="
            h-2
            w-2
            rounded-full
            bg-emerald-400/50

            transition-colors
            duration-500

            group-hover:bg-black/50
          "
        />
      </div>
    );
  }

  /* =======================================================
      PAPER SELECTION
  ======================================================= */

  if (index === 3) {
    return (
      <div
        className="
          pointer-events-none
          absolute
          bottom-7
          right-7

          flex
          items-center
          gap-3

          opacity-60

          transition-opacity
          duration-500

          group-hover:opacity-80
        "
      >
        <BookOpen
          className="
            h-11
            w-11

            text-blue-400/15

            transition-colors
            duration-500

            group-hover:text-black/[0.12]
          "
        />

        <div className="space-y-2">
          <div
            className="
              h-1.5
              w-14
              rounded-full
              bg-blue-400/15

              transition-colors
              duration-500

              group-hover:bg-black/10
            "
          />

          <div
            className="
              h-1
              w-10
              rounded-full
              bg-blue-400/10

              transition-colors
              duration-500

              group-hover:bg-black/[0.07]
            "
          />
        </div>
      </div>
    );
  }

  /* =======================================================
      RESEARCH INTELLIGENCE
  ======================================================= */

  return (
    <div
      className="
        pointer-events-none
        absolute
        bottom-7
        left-7
        right-7

        opacity-60

        transition-opacity
        duration-500

        group-hover:opacity-80
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            h-6
            w-6
            rounded-lg

            border-[1.5px]
            border-primary/20

            transition-colors
            duration-500

            group-hover:border-black/15
          "
        />

        <div
          className="
            h-[1.5px]
            flex-1

            bg-primary/15

            transition-colors
            duration-500

            group-hover:bg-black/10
          "
        />

        <div
          className="
            h-3
            w-3
            rounded-full

            bg-primary/40

            transition-colors
            duration-500

            group-hover:bg-black/40
          "
        />

        <div
          className="
            h-[1.5px]
            w-14

            bg-primary/15

            transition-colors
            duration-500

            group-hover:bg-black/10
          "
        />

        <div
          className="
            h-6
            w-6
            rounded-lg

            border-[1.5px]
            border-primary/20

            transition-colors
            duration-500

            group-hover:border-black/15
          "
        />
      </div>
    </div>
  );
}