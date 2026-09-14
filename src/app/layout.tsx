import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TrpcProvider } from "@/providers/TrpcProvider";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Aetheris", template: "%s | Aetheris" },
  description:
    "Autonomous cyber deception. Aetheris redirects attackers into AI-generated sandboxed twins while production stays untouched.",
  openGraph: {
    siteName: "Aetheris",
    type: "website",
    title: "Aetheris",
    description:
      "Autonomous cyber deception. Attackers are rerouted into AI-built twins while production stays untouched.",
  },
};

export const viewport: Viewport = {
  themeColor: "#101216",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#e9b44c",
          colorBackground: "#14171c",
          colorInputBackground: "#1a1e24",
          colorInputText: "#ececec",
          colorText: "#ececec",
          colorTextSecondary: "#9aa0a8",
          colorTextOnPrimaryBackground: "#1f1a0f",
          borderRadius: "6px",
          fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          card: "shadow-float border border-border",
          formButtonPrimary:
            "bg-accent text-accent-ink hover:bg-accent-hover font-medium normal-case tracking-normal shadow-none",
          footerActionLink: "text-accent hover:text-accent-hover",
          formFieldInput: "bg-surface-2 border-border-strong focus:border-accent",
          socialButtonsBlockButton: "border-border-strong hover:bg-surface-2",
          userButtonPopoverActionButton: "hover:bg-surface-2",
        },
      }}
    >
      <html
        lang="en"
        className={cn("dark h-full", geist.variable, geistMono.variable, bricolage.variable)}
      >
        <body className="flex min-h-full flex-col bg-bg text-ink">
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <TrpcProvider>{children}</TrpcProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
