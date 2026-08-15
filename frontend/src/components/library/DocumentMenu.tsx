import { Trash2 } from "lucide-react";

interface DocumentMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
}

export function DocumentMenu({
  x,
  y,
  onDelete,
}: DocumentMenuProps) {
  return (
    <div
      style={{
        left: x,
        top: y,
      }}
      className="
        fixed
        z-[100]
        w-44
        overflow-hidden
        rounded-xl
        border-[1.5px]
        border-white/[0.10]
        bg-[#111111]
        p-1
        shadow-[0_20px_50px_rgba(0,0,0,0.55)]
        ring-1
        ring-black/40
        backdrop-blur-xl
      "
    >
      <MenuButton
        danger
        icon={
          <Trash2 className="h-4 w-4" />
        }
        text="Delete document"
        onClick={onDelete}
      />
    </div>
  );
}

function MenuButton({
  icon,
  text,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-3
        py-2.5
        text-left
        text-[11px]
        font-bold
        tracking-[-0.01em]
        transition-all
        duration-150

        ${
          danger
            ? `
              text-red-400
              hover:bg-red-500/[0.10]
              hover:text-red-300
            `
            : `
              text-zinc-300
              hover:bg-white/[0.06]
              hover:text-white
            `
        }
      `}
    >
      <span
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          transition-colors

          ${
            danger
              ? `
                border-red-500/15
                bg-red-500/[0.06]
                group-hover:border-red-500/25
                group-hover:bg-red-500/[0.10]
              `
              : `
                border-white/[0.07]
                bg-white/[0.03]
                group-hover:border-white/[0.12]
                group-hover:bg-white/[0.06]
              `
          }
        `}
      >
        {icon}
      </span>

      <span className="truncate">
        {text}
      </span>
    </button>
  );
}