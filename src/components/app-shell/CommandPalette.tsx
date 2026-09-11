"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, ShieldSlash } from "@phosphor-icons/react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSimulationStore } from "@/store/useSimulationStore";
import { NAV_GROUPS } from "./SidebarNav";
import { useForceDefense } from "./TopBar";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const isRunning = useSimulationStore((s) => s.isSimulationRunning);
  const toggleSimulation = useSimulationStore((s) => s.toggleSimulation);
  const forceDefense = useForceDefense();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command palette" description="Jump to a page or run an action">
      <Command>
        <CommandInput placeholder="Go to page or run an action…" />
        <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {NAV_GROUPS.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem key={item.href} value={item.label} onSelect={() => run(() => router.push(item.href))}>
                <item.icon aria-hidden="true" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandGroup heading="Actions">
          <CommandItem value="Force defense" onSelect={() => run(forceDefense)}>
            <ShieldSlash aria-hidden="true" />
            Force defense
          </CommandItem>
          <CommandItem
            value={isRunning ? "Halt simulation" : "Resume simulation"}
            onSelect={() => run(toggleSimulation)}
          >
            {isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {isRunning ? "Halt simulation" : "Resume simulation"}
          </CommandItem>
        </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
