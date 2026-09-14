"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/trpc";
import { useSimulationEngine } from "@/simulation/engine";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { ForceDefenseDialog } from "./ForceDefenseDialog";
import { setSidebarCollapsed, useSidebarCollapsed } from "./sidebar-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  useSimulationEngine();
  const autonomous = api.org.getSettings.useQuery().data?.autonomous;
  useEffect(() => {
    if (autonomous !== undefined) useSimulationStore.getState().setAutonomous(autonomous);
  }, [autonomous]);

  const toggle = () => setSidebarCollapsed(!collapsed);

  return (
    <TooltipProvider delay={300}>
      <div className="flex h-dvh overflow-hidden">
        <SidebarNav collapsed={collapsed} onToggle={toggle} className="hidden md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenPalette={() => setPaletteOpen(true)} onOpenMobileNav={() => setMobileOpen(true)} onForceDefense={() => setForceOpen(true)} />
          <main id="main" className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-60 p-0 sm:max-w-60" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarNav onNavigate={() => setMobileOpen(false)} className="w-full border-r-0" />
          </SheetContent>
        </Sheet>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onForceDefense={() => setForceOpen(true)} />
        <ForceDefenseDialog open={forceOpen} onOpenChange={setForceOpen} />
      </div>
    </TooltipProvider>
  );
}
