import { useEffect, useRef } from "react";
import { Pin } from "lucide-react";

import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/formatters";

import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onRename: () => void;
  onCancelRename: () => void;
  onOpen: () => void;
  onTogglePin: () => void;
  onContextMenu: (left: number, top: number) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onRename,
  onCancelRename,
  onOpen,
  onTogglePin,
  onContextMenu,
}: ConversationItemProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select();
    }
  }, [isEditing]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (isEditing) {
          return;
        }

        if (
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          onOpen();
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
         * Compact conversation row.
         *
         * No white active state.
         * No oversized card.
         */
        "group w-full cursor-pointer rounded-md border px-2.5 py-1.5 text-left transition-colors duration-150",

        isEditing
          ? "border-primary/30 bg-primary/[0.06]"
          : isActive
          ? "border-primary/20 bg-primary/[0.07]"
          : "border-transparent hover:bg-white/[0.025]",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Pinned indicator */}

          {conversation.isPinned && (
            <Pin
              className="
                h-3
                w-3
                shrink-0
                text-zinc-500
              "
            />
          )}

          {/* Title / editing */}

          {isEditing ? (
            <input
              autoFocus
              ref={inputRef}
              value={editingTitle}
              onClick={(e) =>
                e.stopPropagation()
              }
              onChange={(e) =>
                onEditingTitleChange(
                  e.target.value,
                )
              }
              onBlur={onRename}
              onKeyDown={(e) => {
                e.stopPropagation();

                if (e.key === "Enter") {
                  e.preventDefault();
                  onRename();
                  return;
                }

                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelRename();
                }
              }}
              className="
                w-full
                border-none
                bg-transparent
                text-[12px]
                font-medium
                text-white
                outline-none
                placeholder:text-zinc-600
              "
              style={{
                caretColor: "#6366f1",
              }}
            />
          ) : (
            <p
              className={cn(
                "min-w-0 truncate text-[12px] font-medium",
                isActive
                  ? "text-zinc-100"
                  : "text-zinc-400",
              )}
            >
              {conversation.title}
            </p>
          )}
        </div>

        {/* Pin action */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          aria-label={
            conversation.isPinned
              ? "Unpin conversation"
              : "Pin conversation"
          }
          className="
            shrink-0
            rounded-md
            p-1
            text-zinc-700
            opacity-0
            transition-all
            duration-150
            hover:bg-white/[0.04]
            hover:text-zinc-400
            group-hover:opacity-100
          "
        >
          <Pin className="h-3 w-3" />
        </button>
      </div>

      {/* Metadata */}

      <p
        className={cn(
          "mt-0.5 text-[9px] font-mono leading-3.5 text-zinc-600",
          isEditing
            ? "opacity-40"
            : "opacity-100",
        )}
      >
        {conversation.messageCount} msgs
        {" · "}
        {formatRelativeDate(
          conversation.lastActivityAt,
        )}
      </p>
    </div>
  );
}