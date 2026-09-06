import { useCallback } from "react";

import {
  recordResearchActivity,
  type ResearchActivityType,
} from "@/services/activity";

export function useResearchActivity() {
  const record = useCallback(
    (paperId: string, eventType: ResearchActivityType) => {
      if (!paperId) return Promise.resolve();
      return recordResearchActivity(paperId, eventType).catch((error) => {
        console.warn("Failed to record research activity:", error);
      });
    },
    [],
  );

  return { record };
}
