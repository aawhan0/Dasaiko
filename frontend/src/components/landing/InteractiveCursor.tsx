import { useEffect, useRef } from "react";
import gsap from "gsap";

export function InteractiveCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const spotlight = spotlightRef.current;

    if (!dot || !ring || !spotlight) return;

    const mediaQuery = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    if (!mediaQuery.matches) {
      return;
    }

    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const ringPosition = {
      x: mouse.x,
      y: mouse.y,
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;

      gsap.to(dot, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.08,
        ease: "power3.out",
        overwrite: true,
      });

      gsap.to(spotlight, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.35,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const ticker = () => {
      ringPosition.x +=
        (mouse.x - ringPosition.x) * 0.16;

      ringPosition.y +=
        (mouse.y - ringPosition.y) * 0.16;

      gsap.set(ring, {
        x: ringPosition.x,
        y: ringPosition.y,
      });
    };

    const handlePointerDown = () => {
      gsap.to(ring, {
        scale: 0.72,
        duration: 0.12,
        ease: "power2.out",
      });

      gsap.to(dot, {
        scale: 0.7,
        duration: 0.12,
        ease: "power2.out",
      });
    };

    const handlePointerUp = () => {
      gsap.to(ring, {
        scale: 1,
        duration: 0.35,
        ease: "elastic.out(1, 0.45)",
      });

      gsap.to(dot, {
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const interactive = target.closest(
        "[data-cursor]",
      ) as HTMLElement | null;

      if (!interactive) return;

      const type =
        interactive.dataset.cursor;

      if (type === "magnetic") {
        gsap.to(ring, {
          scale: 1.6,
          borderWidth: 1,
          duration: 0.35,
          ease: "power3.out",
        });

        gsap.to(dot, {
          scale: 0.65,
          duration: 0.25,
          ease: "power3.out",
        });

        return;
      }

      if (type === "view") {
        gsap.to(ring, {
          scale: 2.4,
          backgroundColor:
            "rgba(255,255,255,0.08)",
          borderColor:
            "rgba(255,255,255,0.35)",
          duration: 0.35,
          ease: "power3.out",
        });

        gsap.to(dot, {
          scale: 0,
          duration: 0.2,
          ease: "power2.out",
        });

        return;
      }

      if (type === "text") {
        gsap.to(ring, {
          scale: 0.75,
          duration: 0.3,
          ease: "power3.out",
        });
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const interactive = target.closest(
        "[data-cursor]",
      );

      if (!interactive) return;

      gsap.to(ring, {
        scale: 1,
        backgroundColor:
          "rgba(255,255,255,0)",
        borderColor:
          "rgba(255,255,255,0.22)",
        borderWidth: 1,
        duration: 0.35,
        ease: "power3.out",
      });

      gsap.to(dot, {
        scale: 1,
        duration: 0.25,
        ease: "power3.out",
      });
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    window.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    document.addEventListener(
      "mouseover",
      handleMouseOver,
    );

    document.addEventListener(
      "mouseout",
      handleMouseOut,
    );

    gsap.ticker.add(ticker);

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp,
      );

      document.removeEventListener(
        "mouseover",
        handleMouseOver,
      );

      document.removeEventListener(
        "mouseout",
        handleMouseOut,
      );

      gsap.ticker.remove(ticker);

      gsap.killTweensOf([
        dot,
        ring,
        spotlight,
      ]);
    };
  }, []);

  return (
    <>
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          left-0
          top-0
          z-[9990]
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/[0.045]
          blur-3xl
        "
      />

      <div
        ref={ringRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          left-0
          top-0
          z-[9999]
          h-10
          w-10
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-white/[0.22]
          bg-transparent
          will-change-transform
        "
      />

      <div
        ref={dotRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          left-0
          top-0
          z-[10000]
          h-1.5
          w-1.5
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white
          will-change-transform
        "
      />
    </>
  );
}