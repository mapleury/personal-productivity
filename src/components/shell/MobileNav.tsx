"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Mic, Sun, Timer, ListTodo } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/", icon: LayoutGrid, label: "Home" },
  { href: "/today", icon: Sun, label: "Today" },
  { href: "/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/focus", icon: Timer, label: "Focus" },
  { href: "/assistant", icon: Mic, label: "AI" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-line bg-surface/95 backdrop-blur md:hidden">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              active ? "text-accent" : "text-ink-3",
            )}
          >
            <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
