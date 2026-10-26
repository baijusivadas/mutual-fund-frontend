import { memo, useMemo, useCallback } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
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
  } = useMemo(() => {
    let fPnL = 0;
    let fMargin = 0;
    let oPnL = 0;
    let oPremium = 0;
    let posVal = 0;

    for (const pos of positions) {
      posVal += calculateValue(pos);
      if (pos.derivative_type === "futures") {
        fPnL += calculatePnL(pos);
        fMargin += pos.margin_used || 0;
      } else {
        oPnL += calculatePnL(pos);
        oPremium += pos.premium_paid || 0;
      }
    }

    return {
      totalFuturesPnL: fPnL,
      totalFuturesMargin: fMargin,
      totalOptionsPnL: oPnL,
      totalPremiumPaid: oPremium,
      totalPositionValue: posVal,
    };
  }, [positions]);

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
        <MetricCard
          title="Total Position Value"
          value={isLoading ? "..." : `₹${(totalPositionValue / 100000).toFixed(2)}L`}
          change="Combined F&O Notional"
          changeType="neutral"
          icon={Activity}
        />
        <MetricCard
          title="Futures P&L"
          value={isLoading ? "..." : `₹${totalFuturesPnL.toLocaleString("en-IN")}`}
          change={
            totalFuturesMargin > 0
              ? `${((totalFuturesPnL / totalFuturesMargin) * 100).toFixed(2)}% Return`
              : "No Margin Data"
          }
          changeType={totalFuturesPnL >= 0 ? "positive" : "negative"}
          icon={totalFuturesPnL >= 0 ? TrendingUp : TrendingDown}
        />
        <MetricCard
          title="Options P&L"
          value={isLoading ? "..." : `₹${totalOptionsPnL.toLocaleString("en-IN")}`}
          change={`Premium: ₹${totalPremiumPaid.toLocaleString("en-IN")}`}
          changeType={totalOptionsPnL >= 0 ? "positive" : "negative"}
          icon={totalOptionsPnL >= 0 ? TrendingUp : TrendingDown}
        />
        <MetricCard
          title="Total Margin Used"
          value={isLoading ? "..." : `₹${(totalFuturesMargin / 100000).toFixed(2)}L`}
          change="Futures Margin"
          changeType="neutral"
          icon={AlertCircle}
        />
      </div>

      <DataManager<DerivativePosition, typeof DEFAULT_FORM_DATA>
        entity="derivatives"
        title="Derivatives Positions"
        description="Manage your futures and options contracts"
        icon={<Activity className="h-8 w-8 text-primary" />}
        hideHeader={true}
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
