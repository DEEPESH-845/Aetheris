import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <BrandMark size={28} />
      <div className="space-y-2">
        <p className="font-mono text-xs text-ink-subtle">404</p>
        <h1 className="text-xl font-medium">This page does not exist</h1>
        <p className="max-w-sm text-sm text-ink-muted">
          The address may be mistyped, or the page moved. Head back to the overview to keep working.
        </p>
      </div>
      <div className="flex gap-2">
        <Button render={<Link href="/dashboard" />}>Back to overview</Button>
        <Button variant="ghost" render={<Link href="/" />}>
          Home
        </Button>
      </div>
    </main>
  );
}
