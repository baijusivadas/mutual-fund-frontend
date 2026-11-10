import { formatCurrency, formatIndianUnits } from "@/utils/format";
import { memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, AlertCircle, BarChart3, DollarSign, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataManager } from "@/components/shared/DataManager";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { ColumnConfig } from "@/components/shared/CommonTable";
import api from "@/services/api";
import { ChartInsight } from "@/components/charts/ChartInsight";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

const SPARKLINE_HEIGHT = 44;

/* ── Smooth Sparkline ────────────────────────────────────────── */
const Sparkline = memo(({ data, color = "#2563eb" }: { data: number[]; color?: string }) => {
  const chartData = useMemo(() => {
    const safe = data && data.length > 0 ? data : [10, 15, 20, 25, 30];
    return safe.map((v, i) => ({ i, v }));
  }, [data]);

  const gradId = `deriv-spk-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={SPARKLINE_HEIGHT}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#${gradId})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
});
Sparkline.displayName = "Sparkline";

/* ── KPI Metric Card ─────────────────────────────────────────── */
interface ModernDerivKpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  isPositive?: boolean;
  sparkData: number[];
  sparkColor: string;
  icon: React.ReactNode;
}

const ModernDerivKpiCard = memo(
  ({ title, value, subValue, tag, isPositive = true, sparkData, sparkColor, icon }: ModernDerivKpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border/80 rounded-2xl shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2.5 gap-2">
            <div>
              <p className="text-2xl font-heading font-extrabold text-foreground tracking-tight">{value}</p>
              {subValue && (
                <p className={cn("text-xs font-bold mt-0.5", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {subValue}
                </p>
              )}
            </div>
            <div className="w-[95px] shrink-0">
              <Sparkline data={sparkData} color={sparkColor} />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Live Contract Position</span>
          {tag && (
            <Badge
              variant="outline"
              className={cn("text-[9px] font-bold px-1.5 py-0 rounded border-none", isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}
            >
              {tag}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
ModernDerivKpiCard.displayName = "ModernDerivKpiCard";

interface DerivativePosition {
  id: string;
  contract_name: string;
  derivative_type: "futures" | "options";
  qty: number;
  buy_price: number;
  ltp: number;
  lot_size: number;
  expiry_date: string;
  option_type?: "Call" | "Put";
  strike_price?: number;
  margin_used?: number;
  premium_paid?: number;
}

const DEFAULT_FORM_DATA = {
  contract_name: "",
  derivative_type: "futures",
  qty: "1",
  buy_price: "0",
  ltp: "0",
  lot_size: "1",
  expiry_date: "",
  option_type: "Call",
  strike_price: "0",
  margin_used: "0",
  premium_paid: "0",
};

const SEARCH_KEYS: (keyof DerivativePosition)[] = ["contract_name"];

const calculatePnL = (pos: DerivativePosition) => {
  return (pos.ltp - pos.buy_price) * pos.qty * pos.lot_size;
};

const calculateValue = (pos: DerivativePosition) => {
  return pos.ltp * pos.qty * pos.lot_size;
};

const transformPayload = (data: typeof DEFAULT_FORM_DATA) => ({
  ...data,
  qty: Number(data.qty),
  buy_price: Number(data.buy_price),
  ltp: Number(data.ltp),
  lot_size: Number(data.lot_size),
  strike_price: Number(data.strike_price || 0),
  margin_used: Number(data.margin_used || 0),
  premium_paid: Number(data.premium_paid || 0),
});

const COLUMNS: ColumnConfig<DerivativePosition>[] = [
  { key: "contract_name", label: "Contract", sortable: true, className: "font-semibold text-foreground" },
  {
    key: "derivative_type",
    label: "Type",
    sortable: true,
    render: (item) => (
      <Badge
        variant="secondary"
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
          item.derivative_type === "futures"
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
        }`}
      >
        {item.derivative_type}
      </Badge>
    ),
  },
  { key: "qty", label: "Lots", sortable: true },
  {
    key: "ltp",
    label: "LTP",
    sortable: true,
    className: "font-semibold",
    render: (item) => formatCurrency(item.ltp),
  },
  {
    key: "pnl",
    label: "P&L",
    sortable: true,
    render: (item) => {
      const pnl = calculatePnL(item);
      const isPos = pnl >= 0;
      return (
        <span
          className={`font-heading font-extrabold ${
            isPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isPos ? "+" : ""}{formatCurrency(Math.abs(pnl))}
        </span>
      );
    },
  },
  {
    key: "expiry_date",
    label: "Expiry",
    sortable: true,
    render: (item) =>
      new Date(item.expiry_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];

const Derivatives = () => {
  const { token } = useAuth();

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["derivatives"],
    queryFn: async (): Promise<DerivativePosition[]> => {
      const response = await api.get("/derivatives");
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    enabled: !!token,
  });

  const {
    totalFuturesPnL,
    totalFuturesMargin,
    totalOptionsPnL,
    totalPremiumPaid,
    totalPositionValue,
    totalPnL,
    winningPositions,
    positionChartData,
  } = useMemo(() => {
    let fPnL = 0;
    let fMargin = 0;
    let oPnL = 0;
    let oPremium = 0;
    let posVal = 0;
    let netPnL = 0;
    let winners = 0;

    for (const pos of positions) {
      posVal += calculateValue(pos);
      const positionPnL = calculatePnL(pos);
      netPnL += positionPnL;
      if (positionPnL > 0) winners++;
      if (pos.derivative_type === "futures") {
        fPnL += positionPnL;
        fMargin += pos.margin_used || 0;
      } else {
        oPnL += positionPnL;
        oPremium += pos.premium_paid || 0;
      }
    }

    return {
      totalFuturesPnL: fPnL,
      totalFuturesMargin: fMargin,
      totalOptionsPnL: oPnL,
      totalPremiumPaid: oPremium,
      totalPositionValue: posVal,
      totalPnL: netPnL,
      winningPositions: winners,
      positionChartData: [...positions]
        .sort((a, b) => calculatePnL(b) - calculatePnL(a))
        .slice(0, 8)
        .map((position) => ({
          contract:
            position.contract_name.length > 18
              ? `${position.contract_name.slice(0, 18)}...`
              : position.contract_name,
          pnl: calculatePnL(position),
        })),
    };
  }, [positions]);
  const bestPosition = positionChartData[0];

  const renderForm = useCallback(
    (
      formData: typeof DEFAULT_FORM_DATA,
      setFormData: React.Dispatch<React.SetStateAction<typeof DEFAULT_FORM_DATA>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Contract Name *</Label>
            <Input
              value={formData.contract_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, contract_name: e.target.value }))}
              placeholder="e.g. NIFTY DEC FUT"
            />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={formData.derivative_type}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, derivative_type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="futures">Futures</SelectItem>
                <SelectItem value="options">Options</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Quantity (Lots)</Label>
            <Input
              type="number"
              value={formData.qty}
              onChange={(e) => setFormData((prev) => ({ ...prev, qty: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Buy / Strike Price</Label>
            <Input
              type="number"
              value={formData.buy_price}
              onChange={(e) => setFormData((prev) => ({ ...prev, buy_price: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>LTP (Live Price)</Label>
            <Input
              type="number"
              value={formData.ltp}
              onChange={(e) => setFormData((prev) => ({ ...prev, ltp: e.target.value }))}
            />
          </div>
        </div>
        {formData.derivative_type === "futures" ? (
          <div className="grid gap-2">
            <Label>Margin Used (₹)</Label>
            <Input
              type="number"
              value={formData.margin_used}
              onChange={(e) => setFormData((prev) => ({ ...prev, margin_used: e.target.value }))}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Option Type</Label>
                <Select
                  value={formData.option_type}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, option_type: v as "Call" | "Put" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Put">Put</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Strike Price</Label>
                <Input
                  type="number"
                  value={formData.strike_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, strike_price: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Premium Paid (₹)</Label>
              <Input
                type="number"
                value={formData.premium_paid}
                onChange={(e) => setFormData((prev) => ({ ...prev, premium_paid: e.target.value }))}
              />
            </div>
          </>
        )}
      </div>
    ),
    []
  );

  return (
    <div className="space-y-5 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Activity className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
              Derivatives & F&O Portfolio
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Futures & Options positions monitoring, strike valuation, and margin utilization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40">
            {positions.length} Active Positions
          </Badge>
        </div>
      </div>

      {/* ── Top 4 Modern KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <ModernDerivKpiCard
          title="Total Notional Value"
          value={isLoading ? "..." : formatIndianUnits(totalPositionValue)}
          subValue="Combined F&O Exposure"
          sparkData={[totalPositionValue * 0.9, totalPositionValue * 0.95, totalPositionValue]}
          sparkColor="#2563eb"
          icon={<DollarSign className="h-4 w-4" />}
          tag="Notional"
        />

        <ModernDerivKpiCard
          title="Futures MTM P&L"
          value={isLoading ? "..." : formatCurrency(totalFuturesPnL)}
          subValue={
            totalFuturesMargin > 0
              ? `${((totalFuturesPnL / totalFuturesMargin) * 100).toFixed(2)}% Margin Return`
              : "No Margin Data"
          }
          isPositive={totalFuturesPnL >= 0}
          sparkData={[totalFuturesPnL * 0.8, totalFuturesPnL * 0.9, totalFuturesPnL]}
          sparkColor={totalFuturesPnL >= 0 ? "#10b981" : "#ef4444"}
          icon={totalFuturesPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          tag="Futures"
        />

        <ModernDerivKpiCard
          title="Options MTM P&L"
          value={isLoading ? "..." : formatCurrency(totalOptionsPnL)}
          subValue={`Premium Paid: ${formatCurrency(totalPremiumPaid)}`}
          isPositive={totalOptionsPnL >= 0}
          sparkData={[totalOptionsPnL * 0.8, totalOptionsPnL * 0.9, totalOptionsPnL]}
          sparkColor={totalOptionsPnL >= 0 ? "#10b981" : "#ef4444"}
          icon={totalOptionsPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          tag="Options"
        />

        <ModernDerivKpiCard
          title="Margin Utilization"
          value={isLoading ? "..." : formatIndianUnits(totalFuturesMargin)}
          subValue="SPAN + Exposure Margin"
          sparkData={[totalFuturesMargin * 0.95, totalFuturesMargin]}
          sparkColor="#8b5cf6"
          icon={<AlertCircle className="h-4 w-4" />}
          tag="Capital Locked"
        />
      </div>

      {/* ── Position P&L Chart ── */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Position MTM Breakdown</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Mark-to-market returns per active contract</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              {winningPositions} / {positions.length} Profitable
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-3">
          {isLoading ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              Loading positions...
            </div>
          ) : positionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={positionChartData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => formatIndianUnits(Number(value))}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="contract"
                  width={130}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "P&L"]}
                />
                <ReferenceLine x={0} stroke="hsl(var(--border))" />
                <Bar
                  dataKey="pnl"
                  name="Position P&L"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                >
                  {positionChartData.map((entry) => (
                    <Cell key={entry.contract} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
              No active derivative contracts recorded.
            </div>
          )}
          <ChartInsight>
            {bestPosition
              ? `Net position P&L is ${formatCurrency(totalPnL)}. ${winningPositions} of ${positions.length} positions are profitable; ${bestPosition.contract} leads performance.`
              : "Add derivative positions to see contract-level P&L and performance insights."}
          </ChartInsight>
        </CardContent>
      </Card>

      {/* ── Position Ledger Table ── */}
      <DataManager<DerivativePosition, typeof DEFAULT_FORM_DATA>
        entity="derivatives"
        title="Derivatives Positions"
        description="Manage your futures and options contracts"
        icon={<Activity className="h-8 w-8 text-primary" />}
        hideHeader={true}
        dashboardStyle
        columns={COLUMNS}
        searchKeys={SEARCH_KEYS}
        emptyMessage="No derivatives positions found."
        defaultFormData={DEFAULT_FORM_DATA}
        renderForm={renderForm}
        transformPayload={transformPayload}
      />
    </div>
  );
};

export default memo(Derivatives);
