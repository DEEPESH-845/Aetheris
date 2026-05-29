import type { Metadata } from "next";
import { Outfit, Fira_Code } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aetheris | Autonomous SOC",
  description: "Next-generation DARPA-grade AI cyber defense platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`${outfit.variable} ${firaCode.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-cyber-darker text-text-primary selection:bg-neon-cyan/30 selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
