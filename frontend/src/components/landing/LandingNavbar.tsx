import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  ArrowRight,
  BookOpen,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

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

  const navRef =
    useRef<HTMLElement>(null);

  const logoRef =
    useRef<HTMLButtonElement>(null);

  const ctaRef =
    useRef<HTMLButtonElement>(null);

  const [scrolled, setScrolled] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("");

  /*
   * Navbar entrance + scroll behavior.
   */
  useEffect(() => {
    const nav =
      navRef.current;

    if (!nav) return;

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
        delay: 0.15,
        ease: "power3.out",
      },
    );

    let lastScrollY =
      window.scrollY;

    const handleScroll = () => {
      const currentY =
        window.scrollY;

      setScrolled(currentY > 40);

      /*
       * Don't hide the navbar while
       * the mobile menu is open.
       */
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

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
  }, [menuOpen]);

  /*
   * Detect active section.
   */
  useEffect(() => {
    const sections =
      navItems
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

    return () =>
      observer.disconnect();
  }, []);

  /*
   * Smooth navigation.
   */
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

  /*
   * Magnetic CTA.
   */
  const handleCTA =
    (
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
        x: x * 0.12,
        y: y * 0.12,
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

  /*
   * Logo interaction.
   */
  const handleLogoEnter = () => {
    if (!logoRef.current) return;

    gsap.to(
      logoRef.current.querySelector(
        "[data-logo-icon]",
      ),
      {
        rotate: 8,
        scale: 1.08,
        duration: 0.35,
        ease: "power2.out",
      },
    );
  };

  const handleLogoLeave = () => {
    if (!logoRef.current) return;

    gsap.to(
      logoRef.current.querySelector(
        "[data-logo-icon]",
      ),
      {
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      },
    );
  };

  return (
    <>
      <header
        ref={navRef}
        className={`
          fixed
          left-0
          right-0
          top-0
          z-[100]
          px-4
          pt-4
          transition-all
          duration-500
          sm:px-6
          ${
            scrolled
              ? "pt-3"
              : "pt-4"
          }
        `}
      >
        <div
          className={`
            mx-auto
            flex
            h-14
            max-w-6xl
            items-center
            justify-between
            rounded-2xl
            border
            px-3
            transition-all
            duration-500
            sm:px-4
            ${
              scrolled
                ? `
                  border-white/[0.10]
                  bg-[#09090c]/80
                  shadow-2xl
                  backdrop-blur-2xl
                `
                : `
                  border-white/[0.04]
                  bg-transparent
                `
            }
          `}
        >
          {/* Logo */}

          <button
            ref={logoRef}
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            onMouseEnter={
              handleLogoEnter
            }
            onMouseLeave={
              handleLogoLeave
            }
            className="
              group
              flex
              items-center
              gap-2.5
              px-2
            "
          >
            <div
              data-logo-icon
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-primary
                to-secondary
                shadow-glow-sm
              "
            >
              <BookOpen
                className="
                  h-3.5
                  w-3.5
                  text-white
                "
              />
            </div>

            <span
              className="
                text-sm
                font-bold
                tracking-tight
                text-white
              "
            >
              Dasaiko
            </span>
          </button>

          {/* Desktop navigation */}

          <nav
            className="
              hidden
              items-center
              gap-1
              lg:flex
            "
          >
            {navItems.map(
              (item) => {
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
                      relative
                      rounded-lg
                      px-3
                      py-2
                      text-[10px]
                      font-medium
                      transition-colors
                      duration-300
                    "
                  >
                    <span
                      className={
                        active
                          ? "text-zinc-200"
                          : "text-zinc-600 hover:text-zinc-300"
                      }
                    >
                      {item.label}
                    </span>

                    {active && (
                      <span
                        className="
                          absolute
                          bottom-0.5
                          left-1/2
                          h-px
                          w-4
                          -translate-x-1/2
                          bg-primary
                          shadow-[0_0_8px_rgba(139,92,246,0.8)]
                        "
                      />
                    )}
                  </button>
                );
              },
            )}
          </nav>

          {/* Right */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="
                hidden
                rounded-lg
                px-3
                py-2
                text-[10px]
                font-medium
                text-zinc-500
                transition-colors
                hover:text-zinc-200
                sm:block
              "
            >
              Sign in
            </button>

            <button
              ref={ctaRef}
              type="button"
              data-cursor="view"
              onClick={() =>
                navigate("/login")
              }
              onMouseMove={
                handleCTA
              }
              onMouseLeave={
                resetCTA
              }
              className="
                group
                relative
                hidden
                items-center
                gap-1.5
                overflow-hidden
                rounded-xl
                bg-gradient-to-r
                from-primary
                to-secondary
                px-3.5
                py-2
                text-[10px]
                font-semibold
                text-white
                shadow-glow-sm
                sm:flex
              "
            >
              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
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
                  h-3
                  w-3
                "
              />

              <span className="relative z-10">
                Start Researching
              </span>

              <ArrowRight
                className="
                  relative
                  z-10
                  h-3
                  w-3
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                "
              />
            </button>

            {/* Mobile menu */}

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
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                text-zinc-500
                transition-all
                hover:border-white/[0.12]
                hover:text-zinc-200
                lg:hidden
              "
            >
              {menuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}

        <div
          className={`
            mx-auto
            mt-2
            max-w-6xl
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#09090c]/95
            shadow-2xl
            backdrop-blur-2xl
            transition-all
            duration-500
            lg:hidden
            ${
              menuOpen
                ? "max-h-[500px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }
          `}
        >
          <div className="p-3">
            {navItems.map(
              (item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      item.target,
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-left
                    text-xs
                    text-zinc-500
                    transition-all
                    hover:bg-white/[0.03]
                    hover:text-zinc-200
                  "
                >
                  {item.label}

                  <ArrowRight
                    className="
                      h-3
                      w-3
                      text-zinc-800
                    "
                  />
                </button>
              ),
            )}

            <div
              className="
                my-2
                h-px
                bg-white/[0.05]
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
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-primary
                to-secondary
                px-4
                py-3
                text-xs
                font-semibold
                text-white
              "
            >
              Start Researching

              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}