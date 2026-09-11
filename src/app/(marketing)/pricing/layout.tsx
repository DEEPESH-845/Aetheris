import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Aetheris plans from free evaluation to fully autonomous enterprise SOC deployments. Every paid plan includes a 14-day trial.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
