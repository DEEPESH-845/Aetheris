"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ForceDefenseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const activeThreats = useSimulationStore((s) => s.activeThreats);
  const updateThreatStatus = useSimulationStore((s) => s.updateThreatStatus);
  const setGlobalThreatScore = useSimulationStore((s) => s.setGlobalThreatScore);
  const count = activeThreats.length;

  const confirm = () => {
    activeThreats.forEach((t) => updateThreatStatus(t.id, "RESOLVED"));
    setGlobalThreatScore(12);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Force defense</DialogTitle>
          <DialogDescription>
            {count === 0
              ? "There are no active threats to resolve."
              : `This resolves ${count} active ${count === 1 ? "threat" : "threats"} immediately and resets the threat score. It cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirm} disabled={count === 0}>Resolve all threats</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
