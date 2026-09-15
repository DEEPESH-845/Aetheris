import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface px-4 py-10">
      <Link href="/" aria-label="Aetheris home">
        <BrandMark size={22} />
      </Link>
      {children}
    </main>
  );
}
