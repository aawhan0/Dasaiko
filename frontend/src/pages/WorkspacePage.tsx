import { AppShell } from '@/components/layout/AppShell';
import { ResearchWorkbench } from '@/components/chat/ResearchWorkbench';
import { EvidenceVault } from '@/components/evidence/EvidenceVault';

export function WorkspacePage() {
  return (
    <AppShell>
      <div className="flex-1 grid grid-cols-[1fr_auto] h-full w-full overflow-hidden">
        <ResearchWorkbench />
        <EvidenceVault />
      </div>
    </AppShell>
  );
}
