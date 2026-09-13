import { Hero } from "@/components/marketing/Hero";
import { StackLogos } from "@/components/marketing/StackLogos";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Capabilities } from "@/components/marketing/Capabilities";
import { SandboxCta } from "@/components/marketing/SandboxCta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      {/* Opaque block: the scene behind it pauses while this fills the viewport. */}
      <div data-scene-cover className="bg-bg">
        <StackLogos />
        <Capabilities />
      </div>
      <SandboxCta />
    </>
  );
}
