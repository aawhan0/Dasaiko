import { useMemo, useState, type ReactNode } from "react";
import { recommendStarterPapers, type StarterPaper } from "@/utils/starterPapers";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Lightbulb, Microscope, BriefcaseBusiness, BookOpen, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpload } from "@/hooks/useUpload";
import { useAuth } from "@/context/AuthContext";

export const ONBOARDING_STORAGE_PREFIX = "dasaiko.onboarding.v1";

export function onboardingStorageKey(userId: number) {
  return `${ONBOARDING_STORAGE_PREFIX}.${userId}`;
}

export function hasCompletedOnboarding(userId: number | undefined) {
  if (!userId) return false;
  return localStorage.getItem(onboardingStorageKey(userId)) === "completed";
}

type Role = "student" | "educator" | "researcher" | "curious" | "professional";
type Goal =
  | "understand-papers"
  | "discover-papers"
  | "learn-foundations"
  | "connect-ideas"
  | "project-research"
  | "keep-up";

const roles = [
  { id: "student" as Role, title: "I'm a student", description: "Learn concepts and build a stronger foundation.", icon: GraduationCap },
  { id: "educator" as Role, title: "I'm an educator", description: "Explore research and turn it into better learning.", icon: BookOpen },
  { id: "researcher" as Role, title: "I'm a researcher", description: "Read, investigate, and connect the literature.", icon: Microscope },
  { id: "curious" as Role, title: "I'm learning out of curiosity", description: "Go deeper into the AI/ML topics I care about.", icon: Lightbulb },
  { id: "professional" as Role, title: "I'm a professional", description: "Keep up with research and apply new ideas.", icon: BriefcaseBusiness },
];

const interests = [
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Natural Language Processing",
  "Computer Vision",
  "AI Agents",
  "Reinforcement Learning",
  "Multimodal AI",
  "Speech & Audio",
  "Recommendation Systems",
  "Graph Machine Learning",
  "ML Systems & Infrastructure",
  "AI Safety & Alignment",
];

const goals = [
  { id: "understand-papers" as Goal, label: "Understand research papers" },
  { id: "discover-papers" as Goal, label: "Discover important papers" },
  { id: "learn-foundations" as Goal, label: "Build a strong AI/ML foundation" },
  { id: "connect-ideas" as Goal, label: "Connect ideas across papers" },
  { id: "project-research" as Goal, label: "Find research for a project" },
  { id: "keep-up" as Goal, label: "Keep up with new AI/ML research" },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<StarterPaper | null>(null);
  const { onFileInputChange } = useUpload();

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return role !== null;
    if (step === 2) return selectedInterests.length > 0;
    if (step === 3) return selectedGoals.length > 0;
    return selectedPaper !== null;
  }, [role, selectedGoals.length, selectedInterests.length, step]);

  function toggleInterest(value: string) {
    setSelectedInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function toggleGoal(value: Goal) {
    setSelectedGoals((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  const starterPapers = useMemo(
    () => recommendStarterPapers(selectedInterests),
    [selectedInterests],
  );

  function finish() {
    if (!user) return;
    localStorage.setItem(
      onboardingStorageKey(user.id),
      JSON.stringify({
        status: "completed",
        role,
        interests: selectedInterests,
        goals: selectedGoals,
        starterPaper: selectedPaper?.id ?? null,
        starterQuestion: selectedPaper?.starterQuestion ?? null,
        completedAt: new Date().toISOString(),
      }),
    );
    navigate("/workspace", { replace: true });
  }

  function next() {
    if (!canContinue) return;
    if (step === totalSteps - 1) {
      if (!selectedPaper) return;
      finish();
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-base text-white">
      <div className="pointer-events-none absolute left-[18%] top-[18%] h-[560px] w-[560px] rounded-full bg-primary/[0.07] blur-[180px]" />
      <div className="pointer-events-none absolute right-[8%] bottom-[8%] h-[420px] w-[420px] rounded-full bg-secondary/[0.045] blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.08),transparent_38%)]" />

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-7 sm:px-8 lg:px-12">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <img
            src="/assets/brand/dasaiko-wordmark-transparent-bg.png"
            alt="Dasaiko"
            className="h-auto w-[112px]"
          />
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
              Getting started
            </p>
            <p className="mt-1 text-xs font-semibold text-zinc-400">
              {step + 1} of {totalSteps}
            </p>
          </div>
        </header>

        <div className="mx-auto mt-7 h-1.5 w-full max-w-3xl overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-brand transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center py-12">
          <div className="w-full">
            {step === 0 && (
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.08] shadow-glow">
                  <Sparkles className="h-7 w-7 text-primary-300" />
                </div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-300">
                  Your research journey starts here
                </p>
                <h1 className="font-heading text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-6xl">
                  Let's make Dasaiko yours.
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-7 text-zinc-500 sm:text-base">
                  A few quick choices help us shape your first AI/ML research experience around what you actually want to learn.
                </p>
              </div>
            )}

            {step === 1 && (
              <Question title="What brings you to Dasaiko?" subtitle="Choose what best describes you.">
                <div className="grid gap-3">
                  {roles.map((item) => {
                    const Icon = item.icon;
                    const selected = role === item.id;
                    return (
                      <ChoiceCard
                        key={item.id}
                        selected={selected}
                        onClick={() => setRole(item.id)}
                        icon={<Icon className="h-5 w-5" />}
                        title={item.title}
                        description={item.description}
                      />
                    );
                  })}
                </div>
              </Question>
            )}

            {step === 2 && (
              <Question title="What are you interested in?" subtitle="Pick the AI/ML areas you want to explore. Choose as many as you like.">
                <div className="flex flex-wrap gap-2.5">
                  {interests.map((interest) => {
                    const selected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                          selected
                            ? "border-primary/60 bg-primary/[0.14] text-white shadow-glow-sm"
                            : "border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:border-white/[0.16] hover:bg-white/[0.045] hover:text-zinc-200"
                        }`}
                      >
                        {selected && <Check className="mr-2 inline h-3.5 w-3.5 text-primary-300" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-xs font-medium text-zinc-600">
                  {selectedInterests.length === 0
                    ? "Select at least one area to continue."
                    : `${selectedInterests.length} area${selectedInterests.length === 1 ? "" : "s"} selected`}
                </p>
              </Question>
            )}

            {step === 4 && (
              <Question
                title="Pick your first paper."
                subtitle="Based on your interests, these are great places to start. You can always bring your own paper later."
              >
                <div className="grid gap-3 lg:grid-cols-3">
                  {starterPapers.map((paper, index) => {
                    const selected = selectedPaper?.id === paper.id;
                    const badge =
                      index === 0
                        ? "⭐ Best place to start"
                        : index === 1
                          ? "Great starting point"
                          : "Good next step";

                    return (
                      <button
                        key={paper.id}
                        type="button"
                        onClick={() => setSelectedPaper(paper)}
                        className={`relative flex min-h-[280px] flex-col rounded-2xl border p-5 text-left transition-all duration-200 active:scale-[0.99] ${
                          selected
                            ? "border-primary/60 bg-primary/[0.11] shadow-glow-sm"
                            : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.045]"
                        }`}
                      >
                        <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.09] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary-200">
                          <Star className="h-3 w-3 fill-current" />
                          {badge}
                        </span>
                        <span className="text-lg font-extrabold leading-6 text-white">{paper.title}</span>
                        <span className="mt-2 text-xs font-semibold text-zinc-500">
                          {paper.authors} · {paper.year}
                        </span>
                        <span className="mt-4 text-xs font-medium leading-5 text-zinc-500">{paper.reason}</span>
                        <span className="mt-auto pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                          {paper.difficulty}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("onboarding-local-file")?.click()}
                  className="mt-5 text-xs font-bold text-zinc-500 underline decoration-white/10 underline-offset-4 transition hover:text-zinc-300"
                >
                  Use a local file instead
                </button>
                <input
                  id="onboarding-local-file"
                  type="file"
                  accept="application/pdf"
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </Question>
            )}

            {step === 3 && (
              <Question title="What do you want to do with Dasaiko?" subtitle="Choose what would make Dasaiko useful to you.">
                <div className="grid gap-3">
                  {goals.map((goal) => {
                    const selected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99] ${
                          selected
                            ? "border-primary/50 bg-primary/[0.10] text-white shadow-glow-sm"
                            : "border-white/[0.08] bg-white/[0.025] text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.045]"
                        }`}
                      >
                        <span className="text-sm font-semibold">{goal.label}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-white/[0.14] text-transparent"
                        }`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Question>
            )}
          </div>
        </section>

        <footer className="mx-auto flex w-full max-w-3xl items-center justify-between border-t border-white/[0.06] pt-5">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300 disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="hidden text-center sm:block">
            <p className="text-[10px] font-semibold text-zinc-700">
              Your choices shape your starting experience.
            </p>
          </div>

          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-black transition-all duration-200 hover:scale-[1.01] hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100"
          >
            {step === 0 ? "Let's begin" : step === totalSteps - 1 ? "Start researching" : "Continue"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </footer>
      </div>
    </main>
  );
}

function Question({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99] ${
        selected
          ? "border-primary/55 bg-primary/[0.10] shadow-glow-sm"
          : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.045]"
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
        selected
          ? "border-primary/30 bg-primary/15 text-primary-300"
          : "border-white/[0.08] bg-white/[0.035] text-zinc-500 group-hover:text-zinc-300"
      }`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">{description}</span>
      </span>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-primary bg-primary text-white" : "border-white/[0.12] text-transparent"
      }`}>
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
