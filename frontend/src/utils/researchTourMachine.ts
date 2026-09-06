import { RESEARCH_TOUR_STEPS, type ResearchTourStep } from "@/components/tour/tourConfig";

export function getNextResearchTourStep(step: ResearchTourStep): ResearchTourStep | null {
  const index = RESEARCH_TOUR_STEPS.indexOf(step);
  return index >= 0 && index < RESEARCH_TOUR_STEPS.length - 1
    ? RESEARCH_TOUR_STEPS[index + 1]
    : null;
}

export function getPreviousResearchTourStep(step: ResearchTourStep): ResearchTourStep | null {
  const index = RESEARCH_TOUR_STEPS.indexOf(step);
  return index > 0 ? RESEARCH_TOUR_STEPS[index - 1] : null;
}

export function isResearchTourStep(value: string | null): value is ResearchTourStep {
  return Boolean(value && RESEARCH_TOUR_STEPS.includes(value as ResearchTourStep));
}
