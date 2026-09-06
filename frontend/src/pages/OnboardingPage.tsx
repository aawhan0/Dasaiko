import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { getStarterBadge, type StarterPaper } from "@/utils/starterPapers";
import { getStarterRecommendations, type StarterPaperRecommendation } from "@/services/recommendations";
import { updateResearchProfile } from "@/services/auth";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Lightbulb, Microscope, BookOpen, Sparkles, Star, Compass, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpload } from "@/hooks/useUpload";
import { useAuth } from "@/context/AuthContext";

export const ONBOARDING_STORAGE_PREFIX = "dasaiko.onboarding.v1";

export function onboardingStorageKey(userId: number) {
  return `${ONBOARDING_STORAGE_PREFIX}.${userId}`;
}

export function hasCompletedOnboarding(userId: number | undefined) {
  if (!userId) return false;
  const raw = localStorage.getItem(onboardingStorageKey(userId));
  if (!raw) return false;
  if (raw === "completed") return true;
  try { return JSON.parse(raw)?.status === "completed"; } catch { return false; }
}

type Role = "student" | "educator" | "researcher" | "curious" | "professional";
type ResearchFamiliarity = "new" | "few" | "sometimes" | "comfortable" | "advanced";
type Goal =
  | "understand-papers"
  | "discover-papers"
  | "learn-foundations"
  | "connect-ideas"
  | "project-research"
  | "keep-up";

const roles = [
  { id: "student" as Role, title: "Student", description: "Learn AI/ML and build a strong foundation.", icon: GraduationCap },
  { id: "educator" as Role, title: "Teacher / educator", description: "Explore research and turn it into better learning.", icon: BookOpen },
  { id: "curious" as Role, title: "Just curious", description: "Go deeper into the AI/ML topics I care about.", icon: Lightbulb },
];

const interests = [
  "Machine Learning", "Deep Learning", "Generative AI", "Natural Language Processing", "Computer Vision",
  "AI Agents", "Reinforcement Learning", "Multimodal AI", "Speech & Audio", "Recommendation Systems",
  "Graph Machine Learning", "ML Systems & Infrastructure", "AI Safety & Alignment",
];

const researchFamiliarityOptions = [
  { id: "new" as ResearchFamiliarity, title: "Beginner", description: "I've never really read a research paper." , icon: GraduationCap },
  { id: "few" as ResearchFamiliarity, title: "Novice", description: "I've read a few, but I'm still learning how to read them.", icon: BookOpen },
  { id: "comfortable" as ResearchFamiliarity, title: "Comfortable", description: "I read papers regularly and can follow most technical details.", icon: Microscope },
];

const goals = [
  { id: "understand-papers" as Goal, label: "Understand research papers", icon: BookOpen },
  { id: "discover-papers" as Goal, label: "Discover important AI/ML research", icon: Compass },
  { id: "project-research" as Goal, label: "Use research for projects", icon: FlaskConical },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [researchFamiliarity, setResearchFamiliarity] = useState<ResearchFamiliarity | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<StarterPaperRecommendation | null>(null);
  const [starterPapers, setStarterPapers] = useState<StarterPaperRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { onFileInputChange } = useUpload();

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return role !== null;
    if (step === 2) return selectedInterests.length > 0;
    if (step === 3) return researchFamiliarity !== null;
    if (step === 4) return selectedGoals.length > 0;
    return selectedPaper !== null && !isSaving;
  }, [role, researchFamiliarity, selectedGoals.length, selectedInterests.length, selectedPaper, step, isSaving]);

  useEffect(() => {
    if (step !== 5 || !role || !researchFamiliarity || selectedInterests.length === 0 || selectedGoals.length === 0 || starterPapers.length > 0) return;

    let active = true;
    setIsLoadingRecommendations(true);
    setRecommendationError(null);

    updateResearchProfile({
      role,
      interests: selectedInterests,
      goals: selectedGoals,
      research_familiarity: researchFamiliarity,
      onboarding_completed: false,
    })
      .then(() => getStarterRecommendations())
      .then((recommendations) => {
        if (active) {
          setStarterPapers(recommendations);
          setSelectedPaper(null);
        }
      })
      .catch(() => {
        if (active) setRecommendationError("We couldn't load personalized recommendations. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoadingRecommendations(false);
      });

    return () => {
      active = false;
    };
  }, [step, role, researchFamiliarity, selectedInterests, selectedGoals, starterPapers.length]);

  function toggleInterest(value: string) {
    setSelectedInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setStarterPapers([]);
    setSelectedPaper(null);
  }

  function toggleGoal(value: Goal) {
    setSelectedGoals((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setStarterPapers([]);
    setSelectedPaper(null);
  }

  async function finish() {
    if (!user || !selectedPaper || !role || !researchFamiliarity) return;
    setIsSaving(true);

    try {
      await updateResearchProfile({
        role,
        interests: selectedInterests,
        goals: selectedGoals,
        research_familiarity: researchFamiliarity,
        onboarding_completed: true,
      });

      sessionStorage.setItem("dasaiko.pendingStarterPaper", selectedPaper.paper_id);
      sessionStorage.setItem("dasaiko.pendingStarterQuestion", selectedPaper.starter_question);
      localStorage.setItem(onboardingStorageKey(user.id), JSON.stringify({
        status: "completed",
        role,
        interests: selectedInterests,
        goals: selectedGoals,
        researchFamiliarity,
        starterPaper: selectedPaper.paper_id,
        starterQuestion: selectedPaper.starter_question,
        completedAt: new Date().toISOString(),
      }));

      navigate("/workspace", { replace: true });
    } catch {
      setRecommendationError("We couldn't save your research profile. Please try again.");
      setIsSaving(false);
    }
  }

  function handleLocalFile(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length || !user || !role || !researchFamiliarity) return;
    onFileInputChange(event);
    void updateResearchProfile({
      role,
      interests: selectedInterests,
      goals: selectedGoals,
      research_familiarity: researchFamiliarity,
      onboarding_completed: true,
    }).then(() => {
      localStorage.setItem(onboardingStorageKey(user.id), JSON.stringify({
        status: "completed", role, interests: selectedInterests, goals: selectedGoals, researchFamiliarity,
        starterPaper: null, starterQuestion: null, completedAt: new Date().toISOString(),
      }));
      sessionStorage.removeItem("dasaiko.pendingStarterPaper");
      sessionStorage.removeItem("dasaiko.pendingStarterQuestion");
      navigate("/workspace", { replace: true });
    });
  }

  function next() {
    if (!canContinue) return;
    if (step === totalSteps - 1) { void finish(); return; }
    setStep((current) => current + 1);
  }

  return (
    <main className="relative h-screen overflow-hidden bg-base text-white">
      <div className="pointer-events-none absolute left-[18%] top-[18%] h-[560px] w-[560px] rounded-full bg-primary/[0.07] blur-[180px]" />
      <div className="pointer-events-none absolute right-[8%] bottom-[8%] h-[420px] w-[420px] rounded-full bg-secondary/[0.045] blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.08),transparent_38%)]" />
      <div className="relative z-10 flex min-h-screen flex-col px-5 py-7 sm:px-8 lg:px-12">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <img src="/assets/brand/dasaiko-wordmark-transparent-bg.png" alt="Dasaiko" className="h-auto w-[112px]" />
          <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Getting started</p><p className="mt-1 text-xs font-semibold text-zinc-400">{step + 1} of {totalSteps}</p></div>
        </header>
        <div className="mx-auto mt-7 h-1.5 w-full max-w-3xl overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} /></div>
        <section className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 items-center justify-center py-5 sm:py-7">
          <div className="w-full">
            {step === 0 && <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/[0.08] bg-white/[0.025] px-6 py-7 text-center shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-10 sm:py-8"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.09] shadow-glow"><Sparkles className="h-5 w-5 text-primary-300" /></div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-300">Your research journey starts here</p><h1 className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">Let's make Dasaiko yours.</h1><p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-zinc-500">A few quick choices will shape your first AI/ML research experience around what you actually want to learn.</p><button type="button" onClick={next} className="group mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-xs font-extrabold text-black transition-all duration-200 hover:scale-[1.01] hover:bg-zinc-100">Let's begin<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></button></div>}
            {step === 1 && <Question title="What brings you to Dasaiko?" subtitle="Choose what best describes you."><div className="grid gap-3">{roles.map((item) => { const Icon = item.icon; return <ChoiceCard key={item.id} selected={role === item.id} onClick={() => setRole(item.id)} icon={<Icon className="h-5 w-5" />} title={item.title} description={item.description} />; })}</div></Question>}
            {step === 2 && <Question title="What are you interested in?" subtitle="Pick the AI/ML areas you want to explore. Choose as many as you like."><div className="flex flex-wrap gap-2">{interests.map((interest) => { const selected = selectedInterests.includes(interest); return <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${selected ? "border-primary/60 bg-primary/[0.14] text-white shadow-glow-sm" : "border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:border-white/[0.16] hover:bg-white/[0.045] hover:text-zinc-200"}`}>{selected && <Check className="mr-2 inline h-3.5 w-3.5 text-primary-300" />}{interest}</button>; })}</div><p className="mt-5 text-xs font-medium text-zinc-600">{selectedInterests.length === 0 ? "Select at least one area to continue." : `${selectedInterests.length} area${selectedInterests.length === 1 ? "" : "s"} selected`}</p></Question>}
            {step === 3 && <Question title="How familiar are you with research papers?" subtitle="No right or wrong answer — this helps us choose the right starting point for you."><div className="grid gap-3">{researchFamiliarityOptions.map((item) => { const Icon = item.icon; return <ChoiceCard key={item.id} selected={researchFamiliarity === item.id} onClick={() => setResearchFamiliarity(item.id)} icon={<Icon className="h-5 w-5" />} title={item.title} description={item.description} />; })}</div></Question>}
            {step === 4 && <Question title="What do you want to do with Dasaiko?" subtitle="Choose what would make Dasaiko useful to you."><div className="grid gap-3">{goals.map((goal) => { const selected = selectedGoals.includes(goal.id); const Icon = goal.icon; return <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)} className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99] ${selected ? "border-primary/50 bg-primary/[0.10] text-white shadow-glow-sm" : "border-white/[0.08] bg-white/[0.025] text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.045]"}`}><span className="flex items-center gap-3 text-sm font-semibold"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary/15 text-primary-200" : "bg-white/[0.04] text-zinc-500"}`}><Icon className="h-4 w-4" /></span>{goal.label}</span><span className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${selected ? "border-primary bg-primary text-white" : "border-white/[0.14] text-transparent"}`}><Check className="h-3.5 w-3.5" /></span></button>; })}</div></Question>}
            {step === 5 && <Question title="Pick your first paper." subtitle="These recommendations use your interests, goals, and research familiarity."><div className="grid gap-3 lg:grid-cols-3">{isLoadingRecommendations ? <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 text-center text-sm text-zinc-500">Personalizing your starting papers…</div> : recommendationError ? <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 text-center text-sm text-zinc-500">{recommendationError}</div> : starterPapers.map((paper, index) => { const selected = selectedPaper?.paper_id === paper.paper_id; return <button key={paper.paper_id} type="button" onClick={() => setSelectedPaper(paper)} aria-pressed={selected} aria-label={`Start with ${paper.title}`} className={`relative flex min-h-[240px] flex-col rounded-2xl border p-5 text-left transition-all duration-200 active:scale-[0.99] ${selected ? "border-primary/60 bg-primary/[0.11] shadow-glow-sm" : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.045]"}`}><span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.09] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary-200"><Star className="h-3 w-3 fill-current" />{getStarterBadge(index)}</span><span className="text-lg font-extrabold leading-6 text-white">{paper.title}</span><span className="mt-2 text-xs font-semibold text-zinc-500">{paper.authors} · {paper.year}</span><span className="mt-4 text-xs font-medium leading-5 text-zinc-500">{paper.reason}</span>{paper.matched_interests.length ? <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-300/70">Matches: {paper.matched_interests.join(" · ")}</span> : null}<span className="mt-auto pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600">{paper.difficulty}</span></button>})}</div><button type="button" onClick={() => document.getElementById("onboarding-local-file")?.click()} className="mt-5 text-xs font-bold text-zinc-500 underline decoration-white/10 underline-offset-4 transition hover:text-zinc-300">Use a local file instead</button><input id="onboarding-local-file" type="file" accept="application/pdf" onChange={handleLocalFile} className="hidden" /></Question>}
          </div>
        </section>
        <footer className={`mx-auto flex w-full max-w-3xl items-center justify-between border-t border-white/[0.06] pt-5 ${step === 0 ? "invisible" : ""}`}><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || isSaving} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300 disabled:invisible"><ArrowLeft className="h-4 w-4" />Back</button><div className="hidden text-center sm:block"><p className="text-[10px] font-semibold text-zinc-700">Your choices shape your starting experience.</p></div><button type="button" onClick={next} disabled={!canContinue} className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-black transition-all duration-200 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? "Saving…" : step === totalSteps - 1 ? "Start researching" : "Continue"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></button></footer>
      </div>
    </main>
  );
}

function Question({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div><div className="mb-6"><h2 className="font-heading text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">{subtitle}</p></div>{children}</div>;
}

function ChoiceCard({ selected, onClick, icon, title, description }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; description: string }) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99] ${selected ? "border-primary/50 bg-primary/[0.10] text-white shadow-glow-sm" : "border-white/[0.08] bg-white/[0.025] text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.045]"}`}><span className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary/15 text-primary-200" : "bg-white/[0.04] text-zinc-500"}`}>{icon}</span><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs font-medium text-zinc-500">{description}</span></span></span><span className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${selected ? "border-primary bg-primary text-white" : "border-white/[0.14] text-transparent"}`}><Check className="h-3.5 w-3.5" /></span></button>;
}
