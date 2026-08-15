import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Layers,
} from "lucide-react";

import { staggerItem } from "@/utils/animations";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/formatters";

import type { Document } from "@/types";

interface DocumentCardProps {
  document: Document;
  isActive?: boolean;
  onClick?: () => void;
  onContextMenu: (
    left: number,
    top: number,
  ) => void;
}

const statusDot: Record<
  Document["status"],
  string
> = {
  ready: "bg-emerald-400",
  processing:
    "bg-amber-400 animate-pulse",
  uploading:
    "bg-indigo-400 animate-pulse",
  error: "bg-red-400",
};

export function DocumentCard({
  document,
  isActive = false,
  onClick,
  onContextMenu,
}: DocumentCardProps) {
  const displayName = (
    document.name ?? ""
  )
    .replace(/\.pdf$/i, "")
    .replace(/\.(txt|docx|md)$/i, "");

  return (
    <motion.div
      variants={staggerItem}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          onClick?.();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();

        const rect =
          e.currentTarget.getBoundingClientRect();

        onContextMenu(
          rect.right + 20,
          rect.top + 6,
        );
      }}
      className={cn(
        /*
         * Compact document row.
         *
         * Avoids the large rounded-card
         * appearance.
         */
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-1.5 transition-colors duration-150",

        isActive
          ? "border-primary/20 bg-primary/[0.07]"
          : "border-transparent hover:bg-white/[0.025]",
      )}
    >
      {/* Document icon */}

      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          isActive
            ? "border-primary/20 bg-primary/[0.08]"
            : "border-white/[0.06] bg-white/[0.02]",
        )}
      >
        <FileText
          className={cn(
            "h-3.5 w-3.5",
            isActive
              ? "text-primary"
              : "text-zinc-600",
          )}
        />
      </div>

      {/* Document information */}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-[11px] font-medium",
              isActive
                ? "text-zinc-100"
                : "text-zinc-400",
            )}
          >
            {displayName}
          </span>

          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              statusDot[document.status],
            )}
          />
        </div>

        <div
          className="
            mt-0.5
            flex
            items-center
            gap-2
            text-[9px]
            leading-3
            text-zinc-600
          "
        >
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {formatRelativeDate(
              document.uploadedAt,
            )}
          </span>

          {document.pageCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-2.5 w-2.5" />
              {document.pageCount}p
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}