import { motion } from "framer-motion";
import {
  FileText,
  MoreHorizontal,
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

  onContextMenu?: (
    left: number,
    top: number,
  ) => void;
}



const statusDot: Record<Document["status"], string> = {
  ready: "bg-emerald-400",
  processing: "bg-amber-400 animate-pulse",
  uploading: "bg-indigo-400 animate-pulse",
  error: "bg-red-400",
};

export function DocumentCard({
  document,
  isActive = false,
  onClick,
  onContextMenu,
}: DocumentCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();

        const rect =
          e.currentTarget.getBoundingClientRect();

        onContextMenu?.(
          rect.right + 20,
          rect.top + 8,
        );
      }}
      
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer group",
        isActive
          ? "bg-primary/10 border-primary/20"
          : "border-transparent hover:bg-hover"
      )}
    >
      {/* File Icon */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0",
          isActive
            ? "bg-primary/15 border-primary/30"
            : "bg-surface border-white/[0.06]"
        )}
      >
        <FileText
          className={cn(
            "w-4 h-4",
            isActive ? "text-primary" : "text-zinc-500"
          )}
        />
      </div>

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-[13px] font-medium truncate",
              isActive ? "text-white" : "text-zinc-300"
            )}
          >
            {(document.name ?? "")
              .replace(/\.pdf$/i, "")
              .replace(/\.(txt|docx|md)$/i, "")}
          </span>

          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              statusDot[document.status]
            )}
          />
        </div>

        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeDate(document.uploadedAt)}
          </span>

          {document.pageCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {document.pageCount} pages
            </span>
          )}
        </div>
      </div>

            {/* Actions */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();

          const rect =
            e.currentTarget.getBoundingClientRect();

          onContextMenu?.(
            rect.right + 8,
            rect.bottom + 4,
          );
        }}
        className="
          opacity-0
          group-hover:opacity-100
          transition-opacity
          w-7
          h-7
          rounded-md
          hover:bg-white/10
          flex
          items-center
          justify-center
          text-zinc-500
          hover:text-white
          flex-shrink-0
        "
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </motion.div>
    
  );
}
