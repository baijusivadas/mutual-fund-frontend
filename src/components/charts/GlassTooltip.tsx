import { formatIndianUnits } from "@/utils/format";

interface GlassTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const GlassTooltip = ({ active, payload, label }: GlassTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-4 py-3 shadow-glass backdrop-blur-md">
      {label && <p className="mb-1.5 text-[11px] font-bold text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-sm shadow-sm" style={{ backgroundColor: p.color }} />
          <span className="text-[11px] text-muted-foreground">{p.name}</span>
          <span className="ml-auto text-[11px] font-bold tabular-nums text-foreground">
            {formatIndianUnits(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

