import { cn } from "@/lib/cn";

/** Tiny inline line chart, no axes. */
export function Sparkline({
  points,
  width = 140,
  height = 40,
  className,
  dot = true,
}: {
  points: number[];
  width?: number;
  height?: number;
  className?: string;
  dot?: boolean;
}) {
  if (!points.length) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((p, i) => [i * step, height - 4 - ((p - min) / span) * (height - 8)] as const);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];
  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
      <path d={d} fill="none" stroke="var(--color-accent-2)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      {dot ? <circle cx={last[0]} cy={last[1]} r={2.6} fill="var(--color-accent)" /> : null}
    </svg>
  );
}

/** Compact vertical bar chart with optional active bar. */
export function Bars({
  values,
  height = 48,
  activeIndex = -1,
  labels,
  className,
  barClassName,
}: {
  values: number[];
  height?: number;
  activeIndex?: number;
  labels?: string[];
  className?: string;
  barClassName?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex items-end gap-[3px]", className)} style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="group relative flex h-full flex-1 items-end" title={labels?.[i] ? `${labels[i]}: ${v}` : String(v)}>
          <div
            className={cn(
              "w-full rounded-[3px] transition-all duration-300 ease-[var(--ease-soft)]",
              i === activeIndex ? "bg-accent" : v === 0 ? "bg-surface-3" : "bg-accent-soft group-hover:bg-[#c6badf]",
              barClassName,
            )}
            style={{ height: `${Math.max(v === 0 ? 4 : 8, (v / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
