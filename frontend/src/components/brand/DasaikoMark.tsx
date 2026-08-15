import type { HTMLAttributes } from "react";

type DasaikoMarkProps =
  HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "gradient" | "white" | "muted";
  };

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
};

const svgSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
};

export function DasaikoMark({
  size = "md",
  variant = "gradient",
  className = "",
  ...props
}: DasaikoMarkProps) {
  const backgroundClass =
    variant === "gradient"
      ? `
          bg-gradient-to-br
          from-primary
          via-primary
          to-secondary
          shadow-[0_0_30px_rgba(139,92,246,0.22)]
        `
      : variant === "white"
        ? "bg-white"
        : "bg-zinc-800";

  const iconClass =
    variant === "white"
      ? "text-black"
      : variant === "muted"
        ? "text-zinc-300"
        : "text-white";

  const innerColor =
    variant === "gradient"
      ? "#050505"
      : variant === "white"
        ? "#FFFFFF"
        : "#18181B";

  return (
    <div
      role="img"
      aria-label="Dasaiko"
      className={`
        ${sizeClasses[size]}
        ${backgroundClass}
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-[28%]
        transition-all
        duration-300
        ${className}
      `}
      {...props}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={`
          ${svgSizes[size]}
          ${iconClass}
        `}
        aria-hidden="true"
      >
        {/* Outer D */}

        <path
          d="
            M7 5.5
            H14.4
            C21.35 5.5 25.5 9.45 25.5 16
            C25.5 22.55 21.35 26.5 14.4 26.5
            H7
            V5.5
            Z
          "
          fill="currentColor"
        />

        {/* Negative space */}

        <path
          d="
            M12 10
            H14
            C18.35 10 20.8 12.05 20.8 16
            C20.8 19.95 18.35 22 14 22
            H12
            V10
            Z
          "
          fill={innerColor}
        />
      </svg>
    </div>
  );
}