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
    <ClerkProvider 
      appearance={{ 
        baseTheme: dark,
        variables: {
          colorPrimary: '#00f3ff',
          colorBackground: '#06060c',
          colorInputBackground: '#0a0a0f',
          colorInputText: '#ffffff',
          colorTextOnPrimaryBackground: '#000000',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
        },
        elements: {
          card: "bg-[#050505] border border-white/10 shadow-[0_0_40px_rgba(0,243,255,0.05)] rounded-xl",
          headerTitle: "font-outfit !text-white text-2xl font-light tracking-widest text-center",
          headerSubtitle: "font-mono !text-gray-400 text-[10px] uppercase tracking-widest text-center mt-2",
          socialButtonsBlockButton: "flex items-center justify-center gap-3 h-11 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all rounded-md !text-white !opacity-100",
          socialButtonsBlockButtonText: "font-mono text-xs font-semibold tracking-wider !text-white",
          socialButtonsProviderIcon: "!opacity-100 invert-0 dark:invert",
          formButtonPrimary: "h-11 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] font-mono text-xs uppercase tracking-widest transition-all rounded-md flex items-center justify-center",
          formFieldInput: "h-11 bg-black border border-white/20 focus:border-neon-cyan !text-white rounded-md px-4 font-mono text-sm transition-colors",
          formFieldLabel: "font-mono text-[10px] uppercase !text-gray-300 tracking-widest mb-1.5",
          footerActionLink: "!text-neon-cyan hover:!text-white transition-colors font-mono text-xs",
          footerActionText: "!text-gray-300 font-mono text-xs",
          dividerText: "!text-gray-400 font-mono text-[10px] uppercase tracking-widest bg-transparent",
          dividerLine: "bg-white/20",
          identityPreviewText: "!text-white font-mono text-sm",
          identityPreviewEditButton: "!text-neon-cyan hover:!text-white transition-colors",
          securedBy: "!text-gray-400",
          userButtonPopoverCard: "bg-[#050505] border border-white/10 shadow-[0_0_40px_rgba(0,243,255,0.05)] rounded-xl",
          userPreviewMainIdentifier: "font-mono !text-white font-semibold",
          userPreviewSecondaryIdentifier: "font-mono !text-gray-400 text-xs",
          userButtonPopoverActionButton: "!text-white hover:!bg-white/10 transition-colors",
          userButtonPopoverActionButtonText: "font-mono !text-white",
          userButtonPopoverActionButtonIcon: "!text-white",
        }
      }}
    >
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
