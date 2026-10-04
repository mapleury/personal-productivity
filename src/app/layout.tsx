import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>
          <div className="flex min-h-dvh">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopBar />
              <main className="flex-1 px-4 pt-5 pb-36 md:px-6 md:pb-28">{children}</main>
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
