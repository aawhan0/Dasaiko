import type { HTMLAttributes } from "react";
import { DasaikoMark } from "./DasaikoMark";

type DasaikoLogoProps =
  HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg";
    variant?: "gradient" | "white" | "muted";
    showTagline?: boolean;
  };

const configuration = {
  sm: {
    mark: "sm" as const,
    text: "text-[15px]",
  },

  md: {
    mark: "md" as const,
    text: "text-[18px]",
  },

  lg: {
    mark: "lg" as const,
    text: "text-[21px]",
  },
};

export function DasaikoLogo({
  size = "md",
  variant = "gradient",
  showTagline = false,
  className = "",
  ...props
}: DasaikoLogoProps) {
  const config = configuration[size];

  const textColor =
    variant === "white"
      ? "text-black"
      : variant === "muted"
        ? "text-zinc-300"
        : "text-white";

  return (
    <div
      className={`
        flex
        items-center
        gap-3.5
        ${className}
      `}
      {...props}
    >
      <DasaikoMark
        size={config.mark}
        variant={variant}
      />

      <div className="flex flex-col">
        <span
          className={`
            ${config.text}
            ${textColor}
            font-extrabold
            leading-none
            tracking-[-0.045em]
          `}
        >
          Dasaiko
        </span>

        {showTagline && (
          <span
            className="
              mt-1.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.20em]
              text-zinc-600
            "
          >
            Research, backed.
          </span>
        )}
      </div>
    </div>
  );
}