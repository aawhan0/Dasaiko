import { Shield } from 'lucide-react';

export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-surface">
      <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      <div>
        <p className="text-[10px] font-medium text-white leading-tight">Private & Secure</p>
        <p className="text-[10px] text-zinc-600 leading-tight">Your documents stay local</p>
      </div>
    </div>
  );
}
