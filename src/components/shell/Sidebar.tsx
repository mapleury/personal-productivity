"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CircleUser,
  Flag,
  History,
  LayoutGrid,
  ListTodo,
  Mic,
  Music,
  Settings,
  Sun,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useSettings } from "@/lib/store/settings";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "General",
    items: [
      { href: "/", icon: LayoutGrid, label: "Dashboard" },
      { href: "/today", icon: Sun, label: "Today" },
      { href: "/tasks", icon: ListTodo, label: "Tasks" },
      { href: "/goals", icon: Target, label: "Goals" },
      { href: "/calendar", icon: CalendarDays, label: "Calendar" },
    ],
  },
  {
    label: "Focus",
    items: [
      { href: "/focus", icon: Timer, label: "Focus Timer" },
      { href: "/music", icon: Music, label: "Music" },
      { href: "/sessions", icon: History, label: "Sessions" },
      { href: "/productivity", icon: Activity, label: "Productivity" },
    ],
  },
  {
    label: "Organize",
    items: [
      { href: "/priorities", icon: Flag, label: "Priorities" },
      { href: "/weekly-plan", icon: CalendarRange, label: "Weekly Plan" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "AI",
    items: [{ href: "/assistant", icon: Mic, label: "Voice Assistant" }],
  },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.href;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl px-3 py-[7px] text-[13px] transition-all duration-200 ease-[var(--ease-soft)]",
        active
          ? "bg-accent-2/30 font-medium text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white/90",
      )}
    >
      <Icon
        size={15}
        strokeWidth={1.9}
        className={cn("shrink-0 transition-colors", active ? "text-[#b9a9e8]" : "text-white/35 group-hover:text-white/70")}
      />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const name = useSettings((s) => s.name);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 p-3 pr-0 md:block">
      <nav className="flex h-full flex-col rounded-panel bg-night px-3 py-5">
        <div className="flex items-center justify-between px-3">
          <Link href="/" className="text-[17px] font-semibold tracking-[-0.02em] text-white">
            wanei<span className="text-[#b9a9e8]">.</span>
          </Link>
          <span className="h-2 w-2 rounded-full bg-[#b9a9e8]" title="Personal OS · online" />
        </div>

        <div className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-0.5 border-t border-white/8 pt-3">
          <NavLink item={{ href: "/settings", icon: Settings, label: "Settings" }} pathname={pathname} />
          <NavLink item={{ href: "/profile", icon: CircleUser, label: "Profile" }} pathname={pathname} />
          <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-2 text-[10px] font-semibold text-white">
              {initials || "W"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-white/90">{name}</span>
              <span className="block text-[10px] text-white/35">Personal OS</span>
            </span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
