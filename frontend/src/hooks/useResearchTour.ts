import { useCallback, useEffect, useState } from "react";

import { RESEARCH_TOUR_STEPS, TOUR_STORAGE_KEYS, type ResearchTourStep } from "@/components/tour/tourConfig";
import { isResearchTourStep } from "@/utils/researchTourMachine";

export function useResearchTour() {
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [activeStep, setActiveStep] = useState<ResearchTourStep | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      setHasCompletedTour(localStorage.getItem(TOUR_STORAGE_KEYS.completed) === "true");
      const storedStep = localStorage.getItem(TOUR_STORAGE_KEYS.active);
      if (isResearchTourStep(storedStep)) setActiveStep(storedStep);
    } finally {
      setIsReady(true);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEYS.completed, "true");
    localStorage.removeItem(TOUR_STORAGE_KEYS.active);
    localStorage.removeItem(TOUR_STORAGE_KEYS.prompt);
    localStorage.removeItem(TOUR_STORAGE_KEYS.questionMessage);
    setHasCompletedTour(true);
    setActiveStep(null);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEYS.completed);
    localStorage.removeItem(TOUR_STORAGE_KEYS.active);
    setHasCompletedTour(false);
    setActiveStep(null);
  }, []);

  const startTour = useCallback((step: ResearchTourStep = RESEARCH_TOUR_STEPS[0]) => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEYS.active, step);
    } catch {
      // Ignore storage failures.
    }
    setActiveStep(step);
    setHasCompletedTour(false);
  }, []);

  return {
    hasCompletedTour,
    activeStep,
    isReady,
    completeTour,
    resetTour,
    startTour,
  };
}
