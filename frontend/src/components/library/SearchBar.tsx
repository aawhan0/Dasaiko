import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = 'Search documents...', onSearch, className }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const clear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-surface border border-white/[0.06] rounded-lg pl-8 pr-8 py-2 text-[13px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
      />
      {value && (
        <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
