import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Architecture", href: "/architecture" },
      { label: "Capabilities", href: "/#capabilities" },
      { label: "Sandbox", href: "/sandbox" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Source on GitHub", href: "https://github.com/aetheris", external: true },
      { label: "Contact sales", href: "mailto:sales@aetheris.ai" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-bg">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <BrandMark size={22} />
          <p className="max-w-xs text-sm text-ink-muted">
            Autonomous cyber deception. Attackers are rerouted into AI-built twins while production stays untouched.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">{col.title}</p>
            {col.links.map((l) =>
              "external" in l && l.external ? (
                <a key={l.href} href={l.href} className="text-sm text-ink-muted hover:text-ink" rel="noreferrer" target="_blank">
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} href={l.href} className="text-sm text-ink-muted hover:text-ink">
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-ink-subtle">
          <span>&copy; {new Date().getFullYear()} Aetheris. All rights reserved.</span>
          <span className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
