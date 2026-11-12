import { memo, useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/constants";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export const Sparkline = memo(({ data, color = CHART_COLORS.blue, height = 44 }: SparklineProps) => {
  const chartData = useMemo(() => {
    const safe = data && data.length > 0 ? data : [0];
    return safe.map((v, i) => ({ i, v }));
  }, [data]);

  const gid = `spk-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gid})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

Sparkline.displayName = "Sparkline";

