import { Lightbulb } from "lucide-react";

interface ChartInsightProps {
  children: React.ReactNode;
}

export function ChartInsight({ children }: ChartInsightProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] px-3.5 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="mr-1 font-bold text-foreground">Key insight:</span>
        {children}
      </p>
    </div>
  );
}
