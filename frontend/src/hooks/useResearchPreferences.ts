import { useCallback, useEffect, useState } from "react";

export const RESEARCH_PREFERENCES_KEY = "dasaiko.researchPreferences";

export interface ResearchPreferences {
  topics: string[];
  updatedAt?: string;
}

const DEFAULT_PREFERENCES: ResearchPreferences = { topics: [] };

export function useResearchPreferences() {
  const [preferences, setPreferences] = useState<ResearchPreferences>(
    DEFAULT_PREFERENCES,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESEARCH_PREFERENCES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ResearchPreferences;
        if (Array.isArray(parsed.topics)) {
          setPreferences({
            topics: parsed.topics.filter((topic) => typeof topic === "string"),
            updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
          });
        }
      }
    } catch {
      // Preferences are an enhancement; never block the workspace.
    } finally {
      setIsReady(true);
    }
  }, []);

  const updatePreferences = useCallback((topics: string[]) => {
    const next: ResearchPreferences = {
      topics: Array.from(new Set(topics.map((topic) => topic.trim()).filter(Boolean))),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(RESEARCH_PREFERENCES_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures.
    }

    setPreferences(next);
  }, []);

  return { preferences, updatePreferences, isReady };
}
