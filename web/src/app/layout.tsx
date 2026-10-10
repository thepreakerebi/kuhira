import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const body = Atkinson_Hyperlegible({ variable: "--font-body", subsets: ["latin"], weight: ["400", "700"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Kuhira", template: "%s · Kuhira" },
  description:
    "Where should Rwanda's next small-scale irrigation hectares go? A planner built on NISR's Seasonal Agricultural Survey.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions (Scribe, Grammarly) add attributes to <html> and <body> before hydration.
    // suppressHydrationWarning ignores attribute differences on these two elements only, not their children.
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <TooltipProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
