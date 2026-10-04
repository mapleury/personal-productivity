import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "soft" | "ghost" | "outline";
type Size = "sm" | "md" | "xs";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-night text-white hover:bg-night-3 active:bg-night",
  accent: "bg-accent text-white hover:bg-accent-2 active:bg-accent",
  soft: "bg-surface-2 text-ink-2 hover:bg-surface-3",
  ghost: "text-ink-2 hover:bg-surface-2",
  outline: "border border-line bg-surface text-ink-2 hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  xs: "h-7 px-2.5 text-[11px] gap-1.5",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-[13px] gap-2",
};

export function Button({
  variant = "soft",
  size = "sm",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-[var(--ease-soft)] disabled:opacity-40 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}

export function IconButton({
  label,
  active,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-all duration-200 ease-[var(--ease-soft)] hover:bg-surface-2",
        active && "bg-accent-soft text-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
