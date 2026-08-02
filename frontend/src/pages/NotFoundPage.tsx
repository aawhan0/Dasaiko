import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-white/[0.08] flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8 text-zinc-500" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-zinc-500 max-w-sm mb-6">
        The research page or workspace route you are looking for does not exist.
      </p>
      <button
        onClick={() => navigate('/workspace')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Workspace
      </button>
    </div>
  );
}
