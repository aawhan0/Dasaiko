import { useCallback, useEffect, useState } from "react";

const RESEARCH_TOUR_STORAGE_KEY =
  "dasaiko.researchTourCompleted";

export function useResearchTour() {
  const [hasCompletedTour, setHasCompletedTour] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    try {
      setHasCompletedTour(
        localStorage.getItem(
          RESEARCH_TOUR_STORAGE_KEY,
        ) === "true",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(
      RESEARCH_TOUR_STORAGE_KEY,
      "true",
    );

    setHasCompletedTour(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(
      RESEARCH_TOUR_STORAGE_KEY,
    );

    setHasCompletedTour(false);
  }, []);

  return {
    hasCompletedTour,
    isReady,
    completeTour,
    resetTour,
  };
}
