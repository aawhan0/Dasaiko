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
        w-40
        rounded-md
        border
        border-white/10
        bg-[#111111]
        shadow-lg
        ring-1
        ring-white/5
        overflow-hidden
        backdrop-blur-md
      "
    >
      <MenuButton
        danger
        icon={<Trash2 size={15} />}
        text="Delete"
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
        w-full
        flex
        items-center
        px-2.5
        py-1.5
        text-[13px]
        font-medium
        leading-5
        transition-colors
        ${
          danger
            ? "text-red-400 hover:bg-red-500/10"
            : "text-zinc-300 hover:bg-white/5"
        }
      `}
    >
      <div className="flex items-center gap-2">
        {icon}
        {text}
      </div>
    </button>
  );
}