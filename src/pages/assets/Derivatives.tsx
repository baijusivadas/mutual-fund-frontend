import { memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { TrendingUp, TrendingDown, Activity, AlertCircle, BarChart3 } from "lucide-react";
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
} from "recharts";

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

const formatCurrency = (value: number) =>
  `${value < 0 ? "-" : ""}₹${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

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
    render: (item) => `₹${item.ltp.toLocaleString("en-IN")}`,
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
          {isPos ? "+" : ""}₹{pnl.toLocaleString("en-IN")}
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
              ? `${position.contract_name.slice(0, 18)}…`
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
            <Label>Lot Size</Label>
            <Input
              type="number"
              value={formData.lot_size}
              onChange={(e) => setFormData((prev) => ({ ...prev, lot_size: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, expiry_date: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Buy Price</Label>
            <Input
              type="number"
              value={formData.buy_price}
              onChange={(e) => setFormData((prev) => ({ ...prev, buy_price: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>LTP (Current Price)</Label>
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
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Derivatives Trading"
        description="Futures & Options contracts monitoring, strike valuation, and margin analysis"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total Position Value"
          value={isLoading ? "..." : `₹${(totalPositionValue / 100000).toFixed(2)}L`}
          change="Combined F&O Notional"
          changeType="neutral"
          icon={Activity}
        />
        <DashboardMetricCard
          title="Futures P&L"
          value={isLoading ? "..." : formatCurrency(totalFuturesPnL)}
          change={
            totalFuturesMargin > 0
              ? `${((totalFuturesPnL / totalFuturesMargin) * 100).toFixed(2)}% Return`
              : "No Margin Data"
          }
          changeType={totalFuturesPnL >= 0 ? "positive" : "negative"}
          icon={totalFuturesPnL >= 0 ? TrendingUp : TrendingDown}
        />
        <DashboardMetricCard
          title="Options P&L"
          value={isLoading ? "..." : formatCurrency(totalOptionsPnL)}
          change={`Premium: ₹${totalPremiumPaid.toLocaleString("en-IN")}`}
          changeType={totalOptionsPnL >= 0 ? "positive" : "negative"}
          icon={totalOptionsPnL >= 0 ? TrendingUp : TrendingDown}
        />
        <DashboardMetricCard
          title="Total Margin Used"
          value={isLoading ? "..." : `₹${(totalFuturesMargin / 100000).toFixed(2)}L`}
          change="Futures Margin"
          changeType="neutral"
          icon={AlertCircle}
        />
      </div>

      <Card className="bg-card border border-border/70 rounded-xl shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <BarChart3 className="h-4 w-4 text-primary" />
            Position P&L
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              Loading positions…
            </div>
          ) : positionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={positionChartData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
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
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "P&L"]}
                />
                <ReferenceLine x={0} stroke="hsl(var(--border))" />
                <Bar
                  dataKey="pnl"
                  name="Position P&L"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                >
                  {positionChartData.map((entry) => (
                    <Cell key={entry.contract} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              No derivative positions available.
            </div>
          )}
          <ChartInsight>
            {bestPosition
              ? `Net position P&L is ${formatCurrency(totalPnL)}. ${winningPositions} of ${positions.length} positions are profitable; ${bestPosition.contract} has the highest P&L in the current list.`
              : "Add derivative positions to see contract-level P&L and performance insights."}
          </ChartInsight>
        </CardContent>
      </Card>

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
