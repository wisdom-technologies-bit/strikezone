import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: { default: "Strikezone", template: "%s · Strikezone" },
  description: "Carrom and Ludo skill games with transparent pricing and verifiable results.",
  applicationName: "Strikezone",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches --surface-0. A manifest needs a literal, so this is the one place the
  // page colour is repeated; keep it in step with the token.
  themeColor: "#0a0f1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-toast focus:rounded-control focus:border focus:border-line-strong focus:bg-raised focus:px-3 focus:py-2 focus:text-small focus:text-ink"
        >
          Skip to content
        </a>
        <ToastProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
