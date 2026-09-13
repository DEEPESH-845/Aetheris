import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { DeceptionScene } from "@/components/marketing/scene/DeceptionScene";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <SmoothScroll>
        <div className="relative z-[1] flex min-h-dvh flex-col pt-16">
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </SmoothScroll>
      {/* After SmoothScroll so its ScrollTriggers are created once the smoother exists. */}
      <DeceptionScene />
    </>
  );
}
