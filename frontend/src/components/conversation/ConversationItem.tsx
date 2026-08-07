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

  onEditingTitleChange: (
    value: string
  ) => void;

  onRename: () => void;

  onCancelRename: () => void;

  onOpen: () => void;

  onTogglePin: () => void;

  onContextMenu: (
    left: number,
    top: number
  ) => void;
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
    useRef<HTMLInputElement>(null);

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
          rect.top + 8
        );
      }}
      className={cn(
        "group w-full cursor-pointer text-left px-3 py-2.5 rounded-lg border transition-all duration-200",
        isEditing
          ? "border-primary shadow-[0_0_18px_rgba(124,58,237,0.35)] bg-primary/10"
          : isActive
          ? "bg-primary/10 border-primary/20"
          : "border-transparent hover:bg-hover"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {conversation.isPinned && (
            <Pin className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
          )}

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
                  e.target.value
                )
              }
              onBlur={onRename}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  onRename();
                }

                if (
                  e.key === "Escape"
                ) {
                  onCancelRename();
                }
              }}
              className="
                w-full
                bg-transparent
                border-none
                outline-none
                text-[13px]
                font-semibold
                text-white
                placeholder:text-zinc-500
              "
              style={{
                caretColor:
                  "#8b5cf6",
              }}
            />
          ) : (
            <p
              className={cn(
                "text-[13px] font-medium truncate",
                isActive
                  ? "text-white"
                  : "text-zinc-300"
              )}
            >
              {conversation.title}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-yellow-400 transition"
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>

      <p
        className={cn(
          "text-[10px] text-zinc-600 mt-1 font-mono transition-opacity duration-200",
          isEditing
            ? "opacity-40"
            : "opacity-100"
        )}
      >
        {conversation.messageCount} msgs ·{" "}
        {formatRelativeDate(
          conversation.lastActivityAt
        )}
      </p>
    </div>
  );
}