import { useEffect, useState } from "react";
import { getResearchPath, type ResearchPathResponse } from "@/services/research";
export function useResearchPath(topic: string | null) {
  const [data, setData] = useState<ResearchPathResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!topic?.trim()) { setData(null); return; } let cancelled=false; setLoading(true); getResearchPath(topic).then(value=>{if(!cancelled)setData(value)}).catch(()=>{if(!cancelled)setData(null)}).finally(()=>{if(!cancelled)setLoading(false)}); return ()=>{cancelled=true}; }, [topic]);
  return { data, loading };
}
