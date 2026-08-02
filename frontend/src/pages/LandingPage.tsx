import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, FileSearch, Database, Zap } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base text-zinc-300 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-glow-sm">
            D
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Dasaiko</span>
        </div>
        <button
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-all shadow-glow"
        >
          Open Workspace
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center relative">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            AI Document Intelligence Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            The AI that <span className="gradient-text">shows its work.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Upload research papers, PDFs and technical documents. Every answer is backed by verifiable, citable sources.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/workspace')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:opacity-95 transition-all shadow-glow"
            >
              Start Researching
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Architecture / Preview Illustration */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="p-4 rounded-2xl border border-white/[0.08] bg-surface/50 glass shadow-2xl overflow-hidden">
          <div className="rounded-xl border border-white/[0.06] bg-base p-6 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/[0.06] bg-surface space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <FileSearch className="w-4 h-4 text-primary" /> 1. Upload & Index
              </div>
              <p className="text-xs text-zinc-500">Vectorize and chunk PDFs, books, and lecture notes automatically.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-surface space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Zap className="w-4 h-4 text-secondary" /> 2. Deep Retrieval
              </div>
              <p className="text-xs text-zinc-500">Semantic RAG retrieves exact passages with page numbers.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-surface space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Database className="w-4 h-4 text-emerald-400" /> 3. Evidence Vault
              </div>
              <p className="text-xs text-zinc-500">View side-by-side citations with high-contrast score badges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06] text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Dasaiko AI. Built for serious document research.</p>
      </footer>
    </div>
  );
}
