import { Search, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/utils/cn";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Search documents...",
  onSearch,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextValue = event.target.value;

    setValue(nextValue);
    onSearch?.(nextValue);
  };

  const clear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <div
      className={cn(
        "relative w-full",
        className,
      )}
    >
      {/* Search icon */}

      <Search
        className="
          pointer-events-none
          absolute
          left-3.5
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-zinc-600
          transition-colors
          duration-200
        "
      />

      {/* Input */}

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search documents"
        className="
          h-10
          w-full
          rounded-xl
          border-[1.5px]
          border-white/[0.08]
          bg-[#0A0A0A]
          py-2
          pl-10
          pr-10
          text-[11px]
          font-semibold
          tracking-tight
          text-zinc-300
          outline-none
          transition-all
          duration-200

          placeholder:font-medium
          placeholder:text-zinc-600

          hover:border-white/[0.13]

          focus:border-primary/40
          focus:bg-[#0C0C0C]
          focus:ring-2
          focus:ring-primary/10
        "
      />

      {/* Clear button */}

      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="
            absolute
            right-2.5
            top-1/2
            flex
            h-6
            w-6
            -translate-y-1/2
            items-center
            justify-center
            rounded-md
            text-zinc-600
            transition-all
            duration-150
            hover:bg-white/[0.06]
            hover:text-zinc-300
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}