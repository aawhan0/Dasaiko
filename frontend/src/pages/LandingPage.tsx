import { InteractiveCursor } from "@/components/landing/InteractiveCursor";
import GradientWaves from "@/components/GradientWaves";

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ResearchUniverse } from "@/components/landing/ResearchUniverse";
import { ResearchFlow } from "@/components/landing/ResearchFlow";
import { QueryRewriteDemo } from "@/components/landing/QueryRewriteDemo";
import { EvidenceSection } from "@/components/landing/EvidenceSection";
import { WorkspaceShowcase } from "@/components/landing/WorkspaceShowcase";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base text-zinc-300">
      {/* =====================================================
          DASAIKO GLOBAL ATMOSPHERE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          overflow-hidden
        "
        aria-hidden="true"
      >
        <GradientWaves
          horizonColor="#120020"
          waveColor="#4C1D95"
          crestColor="#A855F7"
          speed={0.18}
          amplitude={2.4}
          waveScale={0.55}
          waveRatio={0.85}
          swell={30}
          turbulence={15}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={16}
          detail="high"
          brightness={1.05}
          opacity={0.72}
          mouseInteraction={false}
          parallaxStrength={0}
          grain={true}
          grainIntensity={0.025}
          className="absolute inset-0"
        />
      </div>

      {/* =====================================================
          GLOBAL READABILITY MASK
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[1]
          bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,8,10,0.22)_48%,rgba(8,8,10,0.82)_100%)]
        "
        aria-hidden="true"
      />

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="relative z-50">
        <LandingNavbar />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <main className="relative z-10">
        <HeroSection />

        <ResearchUniverse />

        <ResearchFlow />

        <QueryRewriteDemo />

        <EvidenceSection />

        <WorkspaceShowcase />

        <FeatureBento />

        <FinalCTA />
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="relative z-10">
        <LandingFooter />
      </div>

      {/* =====================================================
          CURSOR
      ====================================================== */}

      <InteractiveCursor />
    </div>
  );
}