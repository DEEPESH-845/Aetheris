"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { List, MagnifyingGlass, ShieldSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useSimulationStore } from "@/store/useSimulationStore";
import { NAV_GROUPS, isActiveRoute } from "./SidebarNav";

interface TopBarProps {
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
}

export function useForceDefense() {
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const updateThreatStatus = useSimulationStore((s) => s.updateThreatStatus);
  const setGlobalThreatScore = useSimulationStore((s) => s.setGlobalThreatScore);
  return () => {
    activeThreats.forEach((t) => updateThreatStatus(t.id, "RESOLVED"));
    setGlobalThreatScore(12);
  };
}

export function TopBar({ onOpenPalette, onOpenMobileNav }: TopBarProps) {
  const pathname = usePathname();
  const forceDefense = useForceDefense();
  const group = NAV_GROUPS.find((g) => g.items.some((i) => isActiveRoute(pathname, i.href)));
  const page = group?.items.find((i) => isActiveRoute(pathname, i.href));

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b bg-bg px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <List />
        </Button>
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-ink-subtle sm:block">Aetheris</li>
            {group && (
              <>
                <li className="hidden text-ink-subtle sm:block" aria-hidden="true">/</li>
                <li className="hidden text-ink-subtle sm:block">{group.label}</li>
              </>
            )}
            {page && (
              <>
                <li className="hidden text-ink-subtle sm:block" aria-hidden="true">/</li>
                <li className="truncate font-medium text-ink" aria-current="page">{page.label}</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onOpenPalette} className="gap-2">
          <MagnifyingGlass aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded-badge bg-surface-3 px-1 font-mono text-[10px] text-ink-subtle sm:inline">
            ⌘K
          </kbd>
        </Button>
        <Button variant="danger" size="sm" onClick={forceDefense}>
          <ShieldSlash aria-hidden="true" />
          <span className="hidden sm:inline">Force defense</span>
        </Button>
        <UserButton appearance={{ elements: { avatarBox: "size-7 rounded-control" } }} />
      </div>
    </header>
  );
}
