"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Architecture", href: "/architecture" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Sandbox", href: "/sandbox" },
  { label: "Pricing", href: "/pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (onClick?: () => void, vertical = false) =>
    NAV.map((item) => {
      const active = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          className={cn(
            "rounded-control text-sm transition-colors duration-150 hover:text-ink",
            vertical ? "px-2 py-2" : "px-1 py-1",
            active ? "text-ink" : "text-ink-muted",
          )}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-sticky)] h-16 border-b bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-6 px-6">
        <Link href="/" className="rounded-control" aria-label="Aetheris home">
          <BrandMark size={22} />
        </Link>

        <nav aria-label="Site" className="hidden items-center gap-6 md:flex">
          {links()}
        </nav>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden md:inline-flex">
                Sign in
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button>Open dashboard</Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Button render={<Link href="/dashboard" />}>Open dashboard</Button>
            <UserButton appearance={{ elements: { avatarBox: "size-8 rounded-control" } }} />
          </Show>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <List />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-64 p-6 sm:max-w-64">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <nav aria-label="Site" className="mt-8 flex flex-col">
            {links(() => setOpen(false), true)}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="secondary" className="mt-4">
                  Sign in
                </Button>
              </SignInButton>
            </Show>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
