import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metrics/MetricCard";
import { TrendingUp, TrendingDown, Activity, AlertCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DataManager } from "@/components/shared/DataManager";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface DerivativePosition {
  id: string;
  contract_name: string;
  derivative_type: 'futures' | 'options';
  qty: number;
  buy_price: number;
  ltp: number;
  lot_size: number;
  expiry_date: string;
  option_type?: 'Call' | 'Put';
  strike_price?: number;
  margin_used?: number;
  premium_paid?: number;
}

const Derivatives = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("futures");

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["derivatives"],
    queryFn: async (): Promise<DerivativePosition[]> => {
      const response = await fetch(`${BACKEND_URL}/api/derivatives`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch derivatives");
      return response.json();
    },
    enabled: !!token,
  });

  const futuresPositions = positions.filter(p => p.derivative_type === 'futures');
  const optionsPositions = positions.filter(p => p.derivative_type === 'options');

  const calculatePnL = (pos: DerivativePosition) => {
    return (pos.ltp - pos.buy_price) * pos.qty * pos.lot_size;
  };

  const calculateValue = (pos: DerivativePosition) => {
    return pos.ltp * pos.qty * pos.lot_size;
  };

  const totalFuturesPnL = futuresPositions.reduce((sum, pos) => sum + calculatePnL(pos), 0);
  const totalFuturesMargin = futuresPositions.reduce((sum, pos) => sum + (pos.margin_used || 0), 0);
  const totalOptionsPnL = optionsPositions.reduce((sum, pos) => sum + calculatePnL(pos), 0);
  const totalPremiumPaid = optionsPositions.reduce((sum, pos) => sum + (pos.premium_paid || 0), 0);
  const totalPositionValue = positions.reduce((sum, pos) => sum + calculateValue(pos), 0);

  const defaultFormData = {
    contract_name: "",
    derivative_type: "futures",
    qty: 1,
    buy_price: 0,
    ltp: 0,
    lot_size: 1,
    expiry_date: "",
    option_type: "Call",
    strike_price: 0,
    margin_used: 0,
    premium_paid: 0,
  };

  const renderForm = (formData: any, setFormData: (data: any) => void) => (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Contract Name *</Label>
          <Input value={formData.contract_name} onChange={e => setFormData({ ...formData, contract_name: e.target.value })} placeholder="NIFTY DEC FUT" />
        </div>
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select value={formData.derivative_type} onValueChange={v => setFormData({ ...formData, derivative_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Input type="number" value={formData.qty} onChange={e => setFormData({ ...formData, qty: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Lot Size</Label>
          <Input type="number" value={formData.lot_size} onChange={e => setFormData({ ...formData, lot_size: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Expiry Date</Label>
          <Input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Buy Price</Label>
          <Input type="number" value={formData.buy_price} onChange={e => setFormData({ ...formData, buy_price: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>LTP (Current Price)</Label>
          <Input type="number" value={formData.ltp} onChange={e => setFormData({ ...formData, ltp: e.target.value })} />
        </div>
      </div>
      {formData.derivative_type === 'futures' ? (
        <div className="grid gap-2">
          <Label>Margin Used (₹)</Label>
          <Input type="number" value={formData.margin_used} onChange={e => setFormData({ ...formData, margin_used: e.target.value })} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Option Type</Label>
              <Select value={formData.option_type} onValueChange={v => setFormData({ ...formData, option_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Put">Put</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Strike Price</Label>
              <Input type="number" value={formData.strike_price} onChange={e => setFormData({ ...formData, strike_price: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Premium Paid (₹)</Label>
            <Input type="number" value={formData.premium_paid} onChange={e => setFormData({ ...formData, premium_paid: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Derivatives Trading</h2>
            <p className="text-muted-foreground">Futures & Options positions and analysis</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Position Value"
            value={isLoading ? "..." : `₹${(totalPositionValue / 100000).toFixed(2)}L`}
            change="Combined F&O"
            changeType="neutral"
            icon={Activity}
          />
          <MetricCard
            title="Futures P&L"
            value={isLoading ? "..." : `₹${totalFuturesPnL.toLocaleString()}`}
            change={totalFuturesMargin > 0 ? `${((totalFuturesPnL / totalFuturesMargin) * 100).toFixed(2)}% return` : "No margin data"}
            changeType={totalFuturesPnL >= 0 ? "positive" : "negative"}
            icon={totalFuturesPnL >= 0 ? TrendingUp : TrendingDown}
          />
          <MetricCard
            title="Options P&L"
            value={isLoading ? "..." : `₹${totalOptionsPnL.toLocaleString()}`}
            change={`Premium: ₹${totalPremiumPaid.toLocaleString()}`}
            changeType={totalOptionsPnL >= 0 ? "positive" : "negative"}
            icon={totalOptionsPnL >= 0 ? TrendingUp : TrendingDown}
          />
          <MetricCard
            title="Total Margin Used"
            value={isLoading ? "..." : `₹${(totalFuturesMargin / 100000).toFixed(2)}L`}
            change="Futures margin"
            changeType="neutral"
            icon={AlertCircle}
          />
        </div>

        <DataManager<DerivativePosition>
          entity="derivatives"
          title="Derivatives Positions"
          description="Manage your futures and options contracts"
          icon={<Activity className="h-8 w-8" />}
          columns={[
            { key: "contract_name", label: "Contract", sortable: true, className: "font-medium" },
            { key: "derivative_type", label: "Type", sortable: true, render: (item) => <Badge variant="outline" className="capitalize">{item.derivative_type}</Badge> },
            { key: "qty", label: "Lots", sortable: true },
            { key: "ltp", label: "LTP", render: (item) => `₹${item.ltp.toLocaleString()}` },
            {
              key: "pnl" as any, label: "P&L", render: (item) => {
                const pnl = calculatePnL(item);
                return <span className={pnl >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
                  {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
                </span>
              }
            },
            { key: "expiry_date", label: "Expiry", render: (item) => new Date(item.expiry_date).toLocaleDateString() },
          ]}
          searchKeys={["contract_name"]}
          emptyMessage="No derivatives positions found."
          defaultFormData={defaultFormData}
          renderForm={renderForm}
          transformPayload={(data) => ({
            ...data,
            qty: parseFloat(data.qty),
            buy_price: parseFloat(data.buy_price),
            ltp: parseFloat(data.ltp),
            lot_size: parseFloat(data.lot_size),
            strike_price: parseFloat(data.strike_price || 0),
            margin_used: parseFloat(data.margin_used || 0),
            premium_paid: parseFloat(data.premium_paid || 0),
          })}
        />
      </div>
    </DashboardLayout>
  );
};

export default Derivatives;

