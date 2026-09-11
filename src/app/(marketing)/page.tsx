import { Hero } from "@/components/marketing/Hero";
import { StackLogos } from "@/components/marketing/StackLogos";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Capabilities } from "@/components/marketing/Capabilities";
import { SandboxCta } from "@/components/marketing/SandboxCta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <StackLogos />
      <HowItWorks />
      <Capabilities />
      <SandboxCta />
    </>
  );
}
