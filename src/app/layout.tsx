import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/shell/Providers";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { MusicBar } from "@/components/shell/MusicBar";
import { MobileNav } from "@/components/shell/MobileNav";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { AssistantDock } from "@/components/shell/AssistantDock";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "wanei. — personal productivity OS",
  description: "An intelligent command center for one ambitious person.",
};

const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem("wanei.settings.v1")||"{}");var t=(s.state&&s.state.theme)||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Providers>
          <div className="flex min-h-dvh">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopBar />
              <main className="flex-1 px-5 pt-8 pb-40 md:px-10 md:pt-10 md:pb-32">
                <div className="mx-auto w-full max-w-[1400px]">{children}</div>
              </main>
            </div>
          </div>
          <MusicBar />
          <MobileNav />
          <CommandPalette />
          <AssistantDock />
        </Providers>
      </body>
    </html>
  );
}