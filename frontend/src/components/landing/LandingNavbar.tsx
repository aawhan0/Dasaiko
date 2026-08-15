import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  ArrowRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

import { DasaikoLogo } from "@/components/brand/DasaikoLogo";

const navItems = [
  {
    label: "Research",
    target: "research-universe",
  },
  {
    label: "How it works",
    target: "research-flow",
  },
  {
    label: "Evidence",
    target: "evidence",
  },
  {
    label: "Workspace",
    target: "workspace-showcase",
  },
  {
    label: "Features",
    target: "features",
  },
];

export function LandingNavbar() {
  const navigate = useNavigate();

  const navRef = useRef<HTMLElement>(null);
  const ctaRef =
    useRef<HTMLButtonElement>(null);

  const [scrolled, setScrolled] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("");

  /* =========================================================
     NAVBAR ENTRANCE
  ========================================================= */

  useEffect(() => {
    const nav = navRef.current;

    if (!nav) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        nav,
        {
          y: -30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.1,
          ease: "power3.out",
        },
      );
    }, nav);

    let lastScrollY =
      window.scrollY;

    const handleScroll = () => {
      const currentY =
        window.scrollY;

      setScrolled(currentY > 40);

      if (!menuOpen) {
        if (
          currentY > lastScrollY &&
          currentY > 160
        ) {
          gsap.to(nav, {
            y: -100,
            duration: 0.35,
            ease: "power2.out",
          });
        } else {
          gsap.to(nav, {
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });
        }
      }

      lastScrollY = currentY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      ctx.revert();
    };
  }, [menuOpen]);

  /* =========================================================
     ACTIVE SECTION
  ========================================================= */

  useEffect(() => {
    const sections = navItems
      .map((item) =>
        document.getElementById(
          item.target,
        ),
      )
      .filter(Boolean);

    if (!sections.length) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting,
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio,
              );

          if (visible[0]) {
            setActiveSection(
              visible[0].target.id,
            );
          }
        },
        {
          rootMargin:
            "-25% 0px -55% 0px",

          threshold: [
            0,
            0.1,
            0.25,
            0.5,
          ],
        },
      );

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     SCROLL TO SECTION
  ========================================================= */

  const scrollToSection = (
    target: string,
  ) => {
    const element =
      document.getElementById(
        target,
      );

    if (!element) return;

    setMenuOpen(false);

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* =========================================================
     CTA MAGNET
  ========================================================= */

  const handleCTA = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const button =
      ctaRef.current;

    if (!button) return;

    const rect =
      button.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left -
      rect.width / 2;

    const y =
      event.clientY -
      rect.top -
      rect.height / 2;

    gsap.to(button, {
      x: x * 0.08,
      y: y * 0.08,
      duration: 0.25,
      ease: "power3.out",
    });
  };

  const resetCTA = () => {
    if (!ctaRef.current) return;

    gsap.to(ctaRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        ref={navRef}
        className={`
          fixed
          left-0
          right-0
          top-0
          z-[100]
          px-6
          pt-3
          sm:px-8
          lg:px-10
          ${
            scrolled
              ? "bg-[#050507]/80 backdrop-blur-xl"
              : "bg-transparent"
          }
          transition-colors
          duration-500
        `}
      >
        <div
          className={`
            mx-auto
            flex
            h-[70px]
            max-w-[1480px]
            items-center
            justify-between
            border-b-[1.5px]
            ${
              scrolled
                ? "border-white/[0.10]"
                : "border-white/[0.06]"
            }
            transition-colors
            duration-500
          `}
        >
          {/* =================================================
              BRAND
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="
              group
              flex
              items-center
              py-2
            "
            aria-label="Go to Dasaiko home"
          >
            <DasaikoLogo
              size="lg"
              variant="gradient"
            />
          </button>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav
            className="
              hidden
              items-center
              gap-8
              lg:flex
            "
          >
            {navItems.map((item) => {
              const active =
                activeSection ===
                item.target;

              return (
                <button
                  key={item.target}
                  type="button"
                  data-cursor="view"
                  onClick={() =>
                    scrollToSection(
                      item.target,
                    )
                  }
                  className="
                    group
                    relative
                    py-[24px]
                    text-[13px]
                    font-bold
                    tracking-[-0.015em]
                    transition-colors
                    duration-300
                  "
                >
                  <span
                    className={
                      active
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-white"
                    }
                  >
                    {item.label}
                  </span>

                  <span
                    className={`
                      absolute
                      bottom-0
                      left-1/2
                      h-[3px]
                      -translate-x-1/2
                      rounded-full
                      bg-primary
                      shadow-[0_0_14px_rgba(139,92,246,0.95)]
                      transition-all
                      duration-300
                      ${
                        active
                          ? "w-7 opacity-100"
                          : "w-0 opacity-0"
                      }
                    `}
                  />
                </button>
              );
            })}
          </nav>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            {/* Sign in */}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="
                hidden
                px-2
                py-2
                text-[13px]
                font-bold
                tracking-[-0.01em]
                text-zinc-500
                transition-colors
                duration-300
                hover:text-white
                sm:block
              "
            >
              Sign in
            </button>

            {/* =================================================
                CTA
            ================================================== */}

            <button
              ref={ctaRef}
              type="button"
              data-cursor="view"
              onClick={() =>
                navigate("/login")
              }
              onMouseMove={handleCTA}
              onMouseLeave={resetCTA}
              className="
                group
                relative
                hidden
                items-center
                gap-2.5
                overflow-hidden
                rounded-[13px]
                border-[1.5px]
                border-white/[0.14]
                bg-white/[0.055]
                px-5
                py-3
                text-[13px]
                font-extrabold
                tracking-[-0.015em]
                text-white
                shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                transition-all
                duration-300
                hover:border-white
                hover:bg-white
                hover:text-black
                hover:shadow-[0_10px_35px_rgba(255,255,255,0.10)]
                sm:flex
              "
            >
              <span
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/[0.18]
                  to-transparent
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />

              <Sparkles
                className="
                  relative
                  z-10
                  h-[15px]
                  w-[15px]
                  stroke-[2.2]
                  transition-colors
                  duration-300
                  group-hover:text-black
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
                  stroke-[2.3]
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>

            {/* =================================================
                MOBILE MENU
            ================================================== */}

            <button
              type="button"
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              onClick={() =>
                setMenuOpen(
                  (value) =>
                    !value,
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border-[1.5px]
                border-white/[0.10]
                bg-white/[0.025]
                text-zinc-400
                transition-all
                duration-300
                hover:border-white/[0.18]
                hover:bg-white/[0.07]
                hover:text-white
                lg:hidden
              "
            >
              {menuOpen ? (
                <X
                  className="
                    h-[18px]
                    w-[18px]
                    stroke-[2.3]
                  "
                />
              ) : (
                <Menu
                  className="
                    h-[18px]
                    w-[18px]
                    stroke-[2.3]
                  "
                />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        <div
          className={`
            mx-auto
            max-w-[1480px]
            overflow-hidden
            border-x-[1.5px]
            border-b-[1.5px]
            border-white/[0.08]
            bg-[#08080b]/95
            backdrop-blur-2xl
            transition-all
            duration-500
            lg:hidden
            ${
              menuOpen
                ? "max-h-[520px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }
          `}
        >
          <div className="p-4">
            {navItems.map((item) => {
              const active =
                activeSection ===
                item.target;

              return (
                <button
                  key={item.target}
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      item.target,
                    )
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-white/[0.05]
                    px-3
                    py-4
                    text-left
                    text-sm
                    font-bold
                    transition-colors
                    last:border-b-0
                  "
                >
                  <span
                    className={
                      active
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-white"
                    }
                  >
                    {item.label}
                  </span>

                  <ArrowRight
                    className={`
                      h-4
                      w-4
                      transition-all
                      duration-300
                      ${
                        active
                          ? "text-primary"
                          : "text-zinc-700 group-hover:translate-x-1 group-hover:text-zinc-300"
                      }
                    `}
                  />
                </button>
              );
            })}

            <div
              className="
                my-4
                h-px
                bg-white/[0.07]
              "
            />

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-xl
                bg-white
                px-4
                py-4
                text-sm
                font-extrabold
                text-black
                transition-all
                duration-300
                hover:bg-zinc-200
              "
            >
              Start researching

              <ArrowRight
                className="
                  h-4
                  w-4
                  stroke-[2.3]
                "
              />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}