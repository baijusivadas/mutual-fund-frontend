import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonCard } from "@/components/shared/CommonCard";
import { cn } from "@/lib/utils";
import { formatIndianUnits } from "@/utils/format";
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Shared chart tooltip style (driven by CSS variables for theme support) ──
const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
};

const MONTHLY_PNL = [
  { month: "Jan", realized: 15000, unrealized: 8000 },
  { month: "Feb", realized: 22000, unrealized: 12000 },
  { month: "Mar", realized: -5000, unrealized: -3000 },
  { month: "Apr", realized: 35000, unrealized: 18000 },
  { month: "May", realized: 28000, unrealized: 15000 },
  { month: "Jun", realized: 42000, unrealized: 22000 },
];

const SECTOR_PNL = [
  { sector: "Banking", value: 85000, color: "hsl(var(--chart-1))" },
  { sector: "IT", value: 65000, color: "hsl(var(--chart-4))" },
  { sector: "Energy", value: 45000, color: "hsl(var(--chart-2))" },
  { sector: "Auto", value: 35000, color: "hsl(var(--chart-3))" },
];

const STOCK_PNL = [
  { stock: "Reliance Industries", invested: 587500, current: 612500, pnl: 25000, pnlPercent: 4.26 },
  { stock: "HDFC Bank", invested: 291600, current: 302400, pnl: 10800, pnlPercent: 3.7 },
  { stock: "ICICI Bank", invested: 170000, current: 184000, pnl: 14000, pnlPercent: 8.24 },
  { stock: "TCS", invested: 300000, current: 308000, pnl: 8000, pnlPercent: 2.67 },
  { stock: "Infosys", invested: 222000, current: 228000, pnl: 6000, pnlPercent: 2.7 },
];

interface StockItem {
  stock: string;
  invested: number;
  current: number;
  pnl: number;
  pnlPercent: number;
}

const StockPnLItem = memo(({ item }: { item: StockItem }) => {
  const isPositive = item.pnl >= 0;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {item.stock}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Holding Position</p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-bold shrink-0 border-none px-2.5 py-0.5 rounded-full flex items-center gap-1",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isPositive ? "+" : ""}
            {item.pnlPercent.toFixed(2)}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invested</p>
            <p className="text-base font-heading font-extrabold text-foreground mt-0.5">
              {formatIndianUnits(item.invested)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Value</p>
            <p className="text-base font-heading font-extrabold text-primary mt-0.5">
              {formatIndianUnits(item.current)}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "p-3 rounded-xl border flex items-center justify-between",
            isPositive
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">Net P&amp;L</span>
          <span className="text-base font-heading font-extrabold">
            {isPositive ? "+" : ""}
            {formatIndianUnits(item.pnl)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
StockPnLItem.displayName = "StockPnLItem";

const PnL = () => {
  const { totalRealized, totalUnrealized, overallReturnPct, bestStock } = useMemo(() => {
    const realizedSum = MONTHLY_PNL.reduce((acc, m) => acc + m.realized, 0);
    const unrealizedSum = MONTHLY_PNL.reduce((acc, m) => acc + m.unrealized, 0);

    const totalInvested = STOCK_PNL.reduce((acc, s) => acc + s.invested, 0);
    const totalCurrent = STOCK_PNL.reduce((acc, s) => acc + s.current, 0);
    const best = STOCK_PNL.reduce((prev, curr) => (curr.pnlPercent > prev.pnlPercent ? curr : prev));
    const returnPct = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;

    return {
      totalRealized: realizedSum,
      totalUnrealized: unrealizedSum,
      overallReturnPct: returnPct,
      bestStock: best,
    };
  }, []);

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Profit & Loss Report"
        description="Comprehensive real-time realized & unrealized capital gains analysis"
      />

      {/* Top 4 Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Realized P&L"
          value={formatIndianUnits(totalRealized)}
          change="Booked Profits (YTD)"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Unrealized P&L"
          value={formatIndianUnits(totalUnrealized)}
          change="Open Portfolio Gain"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Overall Return"
          value={`${overallReturnPct.toFixed(1)}%`}
          change="Since Inception"
          changeType="positive"
          icon={Percent}
        />
        <MetricCard
          title="Best Performer"
          value={bestStock.stock}
          change={`+${bestStock.pnlPercent.toFixed(2)}%`}
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monthly P&amp;L Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MONTHLY_PNL} margin={{ top: 10, right: 20, left: 10, bottom: 5 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatIndianUnits(v)}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(val: number) => [formatIndianUnits(val), ""]}
                />
                <Bar dataKey="realized" fill="hsl(var(--chart-1))" name="Realized P&L" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unrealized" fill="hsl(var(--chart-2))" name="Unrealized P&L" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" />
              Sector-wise P&amp;L Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={SECTOR_PNL}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ sector, percent }) => `${sector} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {SECTOR_PNL.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(val: number) => [formatIndianUnits(val), "Gain"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stock-wise Cards */}
      <CommonCard title="Stock-wise Detailed P&L">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STOCK_PNL.map((stock) => (
            <StockPnLItem key={stock.stock} item={stock} />
          ))}
        </div>
      </CommonCard>
    </div>
  );
};

export default memo(PnL);
