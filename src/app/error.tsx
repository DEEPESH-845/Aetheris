"use client";

import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <BrandMark size={28} />
      <div className="space-y-2">
        <h1 className="text-xl font-medium">Something went wrong</h1>
        <p className="max-w-sm text-sm text-ink-muted">
          The page hit an error while rendering. Try again, and if it keeps happening, open the overview.
        </p>
      </div>
      <pre className="max-w-lg overflow-x-auto rounded-control border bg-surface px-4 py-3 text-left font-mono text-xs text-ink-muted">
        {error.message}
      </pre>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" render={<Link href="/dashboard" />}>
          Back to overview
        </Button>
      </div>
    </main>
  );
}
