import { useEffect, useRef } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  LogOut,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WorkspaceShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const context = gsap.context(() => {
      /* =====================================================
         SECTION HEADING ANIMATION
      ====================================================== */

      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          {
            y: 28,
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
          }
        );
      }

      /* =====================================================
         WORKSPACE ANIMATION
      ====================================================== */

      if (workspaceRef.current) {
        gsap.fromTo(
          workspaceRef.current,
          {
            y: 36,
            opacity: 0,
            scale: 0.99,
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
              start: "top 70%",
              once: true,
            },
          }
        );
      }
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workspace-showcase"
      className="
        relative
        overflow-hidden
        bg-base
        py-24
        sm:py-28
        md:py-32
      "
    >
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[52%]
          h-[440px]
          w-[760px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.035]
          blur-[150px]
        "
        aria-hidden="true"
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-5
          sm:px-6
        "
      >
        {/* ===================================================
            SECTION HEADING
        ==================================================== */}

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
              bg-primary/[0.045]
              px-4
              py-2
              text-[9px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-primary
            "
          >
            <Sparkles className="h-3.5 w-3.5" />

            Research workspace
          </div>

          {/* Headline */}

          <h2
            className="
              text-4xl
              font-black
              leading-[0.94]
              tracking-[-0.06em]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-[72px]
            "
          >
            Your research,
            <br />

            <span className="text-zinc-500">
              in one place.
            </span>
          </h2>

          {/* Subtitle */}

          <p
            className="
              relative
              z-20
              mx-auto
              mt-6
              max-w-2xl
              text-sm
              font-semibold
              leading-7
              !text-zinc-300
              opacity-100
              drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]
              sm:text-base
            "
          >
            Ask questions, work with your documents, and keep
            the evidence behind every answer within reach.
          </p>

          {/* Supporting line */}

          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-[11px]
              font-medium
              leading-6
              !text-zinc-500
              opacity-100
              sm:text-xs
            "
          >
            One focused workspace for conversations, source
            documents, retrieved passages, and research context.
          </p>
        </div>

        {/* ===================================================
            WORKSPACE SHOWCASE
        ==================================================== */}

        <div
          ref={workspaceRef}
          className="
            relative
            mx-auto
            mt-12
            max-w-[1240px]
            sm:mt-14
          "
        >
          {/* =================================================
              WORKSPACE FRAME
          ================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-white/[0.12]
              bg-[#050507]
              shadow-[0_40px_120px_rgba(0,0,0,0.58)]
            "
          >
            {/* =================================================
                TOP NAVIGATION
            ================================================== */}

            <div
              className="
                flex
                h-[62px]
                items-center
                justify-between
                border-b
                border-white/[0.08]
                bg-[#080808]
                px-4
                sm:px-5
              "
            >
              {/* Left */}

              <div className="flex items-center gap-3">
                <span
                  className="
                    text-[11px]
                    font-semibold
                    text-zinc-300
                    sm:text-xs
                  "
                >
                  Research Workbench
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.025]
                    px-2
                    py-1
                    text-[8px]
                    font-medium
                    text-zinc-500
                  "
                >
                  2 docs
                </span>
              </div>

              {/* Search */}

              <div
                className="
                  absolute
                  left-1/2
                  hidden
                  h-10
                  w-[250px]
                  -translate-x-1/2
                  items-center
                  gap-2.5
                  rounded-xl
                  border
                  border-white/[0.11]
                  bg-white/[0.025]
                  px-3.5
                  shadow-[0_8px_25px_rgba(0,0,0,0.16)]
                  md:flex
                "
              >
                <Search className="h-4 w-4 text-zinc-500" />

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-zinc-500
                  "
                >
                  Search or ask...
                </span>

                <span
                  className="
                    ml-auto
                    rounded-md
                    border
                    border-white/[0.07]
                    px-1.5
                    py-0.5
                    text-[8px]
                    text-zinc-600
                  "
                >
                  ⌘ K
                </span>
              </div>

              {/* User */}

              <div className="flex items-center gap-2.5">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-primary
                    to-secondary
                    text-[9px]
                    font-bold
                    text-white
                  "
                >
                  M
                </div>

                <span
                  className="
                    hidden
                    text-[9px]
                    font-medium
                    text-zinc-300
                    sm:block
                  "
                >
                  Mira
                </span>

                <div
                  className="
                    hidden
                    h-5
                    w-px
                    bg-white/[0.08]
                    sm:block
                  "
                />

                <div
                  className="
                    hidden
                    items-center
                    gap-1.5
                    text-[9px]
                    font-medium
                    text-zinc-500
                    transition-colors
                    duration-200
                    hover:text-zinc-300
                    sm:flex
                  "
                >
                  <LogOut className="h-3 w-3" />

                  Sign out
                </div>
              </div>
            </div>

            {/* =================================================
                APPLICATION
            ================================================== */}

            <div
              className="
                grid
                min-h-[500px]
                grid-cols-1
                md:grid-cols-[205px_minmax(0,1fr)_285px]
              "
            >
              {/* =================================================
                  LEFT SIDEBAR
              ================================================== */}

              <aside
                className="
                  hidden
                  border-r
                  border-white/[0.08]
                  bg-[#080808]
                  md:flex
                  md:flex-col
                "
              >
                {/* Logo */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    px-4
                    py-4
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-primary
                        to-secondary
                      "
                    >
                      <BookOpen className="h-3.5 w-3.5 text-white" />
                    </div>

                    <span
                      className="
                        text-[14px]
                        font-bold
                        tracking-tight
                        text-white
                      "
                    >
                      Dasaiko
                    </span>
                  </div>

                  <span className="text-sm text-zinc-600">
                    ‹
                  </span>
                </div>

                {/* New Workspace */}

                <div className="px-3 py-3">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-primary/25
                      bg-primary/[0.08]
                      px-3
                      py-2.5
                      text-primary
                    "
                  >
                    <Plus className="h-3.5 w-3.5" />

                    <span className="text-[10px] font-semibold">
                      New Workspace
                    </span>
                  </div>
                </div>

                {/* Tabs */}

                <div className="flex gap-1 px-3">
                  <div
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      px-2
                      py-2
                      text-zinc-200
                    "
                  >
                    <MessageSquare className="h-3 w-3" />

                    <span className="text-[9px] font-semibold">
                      Threads
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      px-2
                      py-2
                      text-zinc-600
                    "
                  >
                    <BookOpen className="h-3 w-3" />

                    <span className="text-[9px] font-medium">
                      Library
                    </span>
                  </div>
                </div>

                {/* Pinned */}

                <div className="mt-6 px-3">
                  <p
                    className="
                      mb-3
                      px-2
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-zinc-600
                    "
                  >
                    Pinned
                  </p>

                  <div
                    className="
                      rounded-xl
                      border
                      border-primary/20
                      bg-primary/[0.07]
                      px-3
                      py-3
                    "
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-primary">
                        ⚑
                      </span>

                      <span className="text-[10px] font-semibold text-zinc-200">
                        Attention Mechanism
                      </span>
                    </div>

                    <p
                      className="
                        mt-2
                        text-[8px]
                        text-zinc-600
                      "
                    >
                      0 msgs · just now
                    </p>
                  </div>
                </div>

                {/* Chats */}

                <div className="mt-6 px-3">
                  <p
                    className="
                      mb-3
                      px-2
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-zinc-600
                    "
                  >
                    All chats
                  </p>

                  <div className="space-y-4 px-2">
                    {[
                      "New Workspace",
                      "New Workspace",
                      "New Workspace",
                    ].map((item, index) => (
                      <div key={`${item}-${index}`}>
                        <p className="text-[10px] font-medium text-zinc-300">
                          {item}
                        </p>

                        <p className="mt-1 text-[7px] text-zinc-700">
                          0 msgs · {index + 1}m ago
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* =================================================
                  MAIN RESEARCH AREA
              ================================================== */}

              <main
                className="
                  flex
                  min-h-[500px]
                  min-w-0
                  flex-col
                  bg-[#050507]
                "
              >
                {/* =================================================
                    USER QUESTION
                ================================================== */}

                <div
                  className="
                    flex
                    items-center
                    justify-end
                    border-b
                    border-white/[0.06]
                    px-5
                    py-4
                    sm:px-7
                  "
                >
                  <div
                    className="
                      rounded-2xl
                      rounded-tr-md
                      bg-white/[0.12]
                      px-4
                      py-2.5
                    "
                  >
                    <span
                      className="
                        text-[10px]
                        font-medium
                        text-zinc-200
                      "
                    >
                      What is attention mechanism and why is it important?
                    </span>
                  </div>
                </div>

                {/* =================================================
                    ANSWER CONTENT
                ================================================== */}

                <div
                  className="
                    px-5
                    pt-7
                    sm:px-7
                    sm:pt-8
                  "
                >
                  {/* Heading — intentionally no icon */}

                  <div className="min-w-0">
                    <h3
                      className="
                        text-[16px]
                        font-bold
                        tracking-tight
                        text-white
                      "
                    >
                      Introduction to Attention Mechanism
                    </h3>

                    <div
                      className="
                        mt-1.5
                        h-px
                        w-52
                        bg-primary/50
                      "
                    />

                    {/* First paragraph */}

                    <p
                      className="
                        mt-5
                        max-w-2xl
                        text-[11px]
                        font-medium
                        leading-6
                        !text-zinc-300
                        opacity-100
                      "
                    >
                      Attention allows a model to focus on the
                      parts of an input that are most relevant to
                      the current output. Instead of treating every
                      token equally, the model learns which
                      information deserves more weight.
                    </p>

                    {/* Secondary heading */}

                    <h3
                      className="
                        mt-7
                        text-[15px]
                        font-bold
                        tracking-tight
                        text-white
                      "
                    >
                      Why it matters
                    </h3>

                    <div
                      className="
                        mt-1.5
                        h-px
                        w-28
                        bg-primary/50
                      "
                    />

                    {/* Second paragraph */}

                    <p
                      className="
                        mt-5
                        max-w-2xl
                        text-[11px]
                        font-medium
                        leading-6
                        !text-zinc-300
                        opacity-100
                      "
                    >
                      It helps models capture relationships between
                      distant parts of a sequence, making it useful
                      for tasks such as machine translation,
                      summarization, and question answering.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    FLEXIBLE SPACE
                    Keeps the composer near the bottom.
                ================================================== */}

                <div className="flex-1" />

                {/* =================================================
                    INPUT / COMPOSER
                ================================================== */}

                <div
                  className="
                    px-5
                    pb-5
                    sm:px-7
                    sm:pb-6
                  "
                >
                  <div
                    className="
                      flex
                      h-[56px]
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/[0.10]
                      bg-white/[0.025]
                      px-4
                      transition-colors
                      duration-200
                      hover:border-white/[0.14]
                    "
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-zinc-600" />

                    <span
                      className="
                        flex-1
                        text-[10px]
                        font-medium
                        !text-zinc-600
                        opacity-100
                      "
                    >
                      Ask a question about your documents...
                    </span>

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-white/[0.06]
                        text-zinc-600
                      "
                    >
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </main>

              {/* =================================================
                  RESEARCH EVIDENCE
              ================================================== */}

              <aside
                className="
                  border-t
                  border-white/[0.08]
                  bg-[#070709]
                  md:border-l
                  md:border-t-0
                "
              >
                {/* Evidence Header */}

                <div
                  className="
                    border-b
                    border-white/[0.07]
                    px-5
                    py-5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-primary/[0.09]
                        text-primary
                      "
                    >
                      <BookOpen className="h-4 w-4" />
                    </div>

                    <div>
                      <h3
                        className="
                          text-[12px]
                          font-bold
                          text-white
                        "
                      >
                        Research Evidence
                      </h3>

                      <p
                        className="
                          mt-1
                          text-[8px]
                          leading-4
                          !text-zinc-500
                          opacity-100
                        "
                      >
                        Every answer is grounded in
                        retrieved paper chunks.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-primary/25
                      bg-primary/[0.05]
                      px-3
                      py-1.5
                    "
                  >
                    <Sparkles className="h-3 w-3 text-primary" />

                    <span
                      className="
                        text-[8px]
                        font-bold
                        text-primary
                      "
                    >
                      5 sources
                    </span>
                  </div>
                </div>

                {/* =================================================
                    EVIDENCE LIST
                    Only TWO sources — keeps the showcase compact.
                ================================================== */}

                <div className="space-y-2.5 p-4">
                  {[
                    {
                      page: "Page 2",
                      chunk: "Chunk 25",
                      relevance: "100%",
                      text: "Self-attention relates different positions of a single sequence in order to compute a representation.",
                      active: false,
                    },
                    {
                      page: "Page 2",
                      chunk: "Chunk 21",
                      relevance: "100%",
                      text: "Attention mechanisms allow models to capture dependencies across different positions in a sequence.",
                      active: true,
                    },
                  ].map((source, index) => (
                    <div
                      key={source.chunk}
                      className={`
                        group
                        rounded-xl
                        border
                        p-3.5
                        transition-all
                        duration-300
                        ${
                          source.active
                            ? "border-primary/35 bg-primary/[0.045] shadow-[0_0_30px_rgba(139,92,246,0.06)]"
                            : "border-white/[0.08] bg-white/[0.015] hover:border-white/[0.14]"
                        }
                      `}
                    >
                      {/* Source Header */}

                      <div className="flex items-start gap-2.5">
                        <FileText
                          className={`
                            mt-0.5
                            h-4
                            w-4
                            shrink-0
                            ${
                              source.active
                                ? "text-primary"
                                : "text-zinc-500"
                            }
                          `}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className="
                                truncate
                                text-[10px]
                                font-bold
                                text-zinc-200
                              "
                            >
                              NIPS-2017-attention-is-all-you-need
                            </p>

                            <span
                              className="
                                shrink-0
                                rounded-full
                                border
                                border-primary/30
                                bg-primary/[0.06]
                                px-2
                                py-1
                                text-[7px]
                                font-bold
                                text-primary
                              "
                            >
                              {source.relevance}
                            </span>
                          </div>

                          <p
                            className="
                              mt-1
                              text-[8px]
                              font-medium
                              text-zinc-600
                            "
                          >
                            {source.page} · {source.chunk}
                          </p>
                        </div>
                      </div>

                      {/* Divider */}

                      <div className="my-2.5 h-px bg-white/[0.06]" />

                      {/* Passage */}

                      <p
                        className="
                          text-[9px]
                          font-medium
                          leading-5
                          !text-zinc-400
                          opacity-100
                        "
                      >
                        {source.text}
                      </p>

                      {/* View */}

                      <div
                        className="
                          mt-2.5
                          flex
                          items-center
                          gap-1
                          text-[8px]
                          font-semibold
                          text-primary
                        "
                      >
                        View in paper

                        <ChevronRight className="h-3 w-3" />
                      </div>

                      {/* Active evidence */}

                      {index === 1 && (
                        <div
                          className="
                            mt-2.5
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-primary/15
                            bg-primary/[0.05]
                            px-2.5
                            py-1.5
                          "
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />

                          <span
                            className="
                              text-[7px]
                              font-semibold
                              !text-zinc-400
                              opacity-100
                            "
                          >
                            Supporting passage selected
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}