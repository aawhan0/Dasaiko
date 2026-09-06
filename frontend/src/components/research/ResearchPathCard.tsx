import type { ResearchPathItem } from "@/services/research";
export function ResearchPathCard({ items }: { items: ResearchPathItem[] }) {
  if (!items.length) return null;
  return <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="mb-3"><p className="text-xs uppercase tracking-wider text-white/40">Research path</p><h3 className="text-base font-semibold text-white">A sensible order to explore this topic</h3></div><div className="space-y-2">{items.map((item,index)=><div key={item.paper_id} className="rounded-xl border border-white/8 p-3"><div className="flex items-center gap-2"><span className="text-xs text-white/40">{index+1}</span><span className="text-xs text-white/50">{item.stage}</span><span className="ml-auto text-xs text-white/40">{item.difficulty}</span></div><p className="mt-1 text-sm font-medium text-white">{item.title}</p><p className="mt-1 text-xs text-white/50">{item.rationale}</p></div>)}</div></section>;
}
