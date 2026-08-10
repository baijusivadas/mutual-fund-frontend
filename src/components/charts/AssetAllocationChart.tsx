import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { PieChart as PieIcon, Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioCompositionItem {
  name: string;
  value: number;
  color: string;
}

interface AssetAllocationChartProps {
  portfolioComposition: PortfolioCompositionItem[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.25))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

export const AssetAllocationChart = ({ portfolioComposition }: AssetAllocationChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const totalValue = portfolioComposition.reduce((sum, item) => sum + item.value, 0);

  const activeItem = activeIndex !== undefined ? portfolioComposition[activeIndex] : null;

  return (
    <Card className="glass-card border border-border/50 rounded-3xl overflow-hidden relative group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <PieIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-extrabold tracking-tight">
                Asset Allocation
              </CardTitle>
              <CardDescription className="text-xs">
                Portfolio distribution across holdings
              </CardDescription>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/40 text-xs font-bold text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" />
            {portfolioComposition.length} {portfolioComposition.length === 1 ? "Holding" : "Holdings"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {portfolioComposition.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart with Center Text Overlay */}
            <div className="md:col-span-6 relative flex items-center justify-center min-h-[240px]">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={portfolioComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={92}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    {portfolioComposition.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-all duration-300 stroke-background stroke-2 cursor-pointer hover:opacity-90"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const share = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
                        return (
                          <div className="glass-card p-3 rounded-2xl border border-border/80 shadow-2xl space-y-1">
                            <p className="text-xs font-bold text-foreground truncate max-w-[200px]">
                              {data.name}
                            </p>
                            <p className="text-sm font-heading font-black text-primary">
                              ₹{data.value.toLocaleString("en-IN")}
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                              {share}% of Portfolio
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {activeItem ? activeItem.name : "Total Value"}
                </span>
                <span className="text-base sm:text-lg font-heading font-black tracking-tight text-foreground truncate max-w-[130px]">
                  ₹{(activeItem ? activeItem.value : totalValue).toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
                {totalValue > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">
                    {activeItem
                      ? `${((activeItem.value / totalValue) * 100).toFixed(1)}%`
                      : `${portfolioComposition.length} Assets`}
                  </span>
                )}
              </div>
            </div>

            {/* Allocation Breakdown List with Progress Bars */}
            <div className="md:col-span-6 space-y-3 max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
              {portfolioComposition.map((item, index) => {
                const sharePercent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                const isHovered = activeIndex === index;

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    className={cn(
                      "p-3 rounded-2xl transition-all cursor-pointer border",
                      isHovered
                        ? "bg-muted/80 border-primary/30 shadow-md scale-[1.02]"
                        : "bg-muted/30 border-transparent hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold truncate text-foreground" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-heading font-extrabold text-foreground">
                          ₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground ml-1.5">
                          ({sharePercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Visual Proportion Bar */}
                    <div className="h-1.5 w-full bg-background/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${sharePercent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <PieIcon className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No portfolio allocation data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
