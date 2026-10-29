import { memo, useCallback } from "react";
import { DataManager, DataManagerRow } from "@/components/shared/DataManager";
import { ColumnConfig } from "@/components/shared/CommonTable";
import { Bitcoin, LandPlot, MonitorUp, PiggyBank } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency } from "@/utils/format";

/* ── Crypto Config ───────────────────────────────────────────────── */
const CRYPTO_DEFAULT_FORM = {
  item_name: "",
  symbol: "",
  quantity: "",
  average_price: "",
  purchase_date: "",
  description: "",
};

const CRYPTO_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "item_name", label: "Asset Name", sortable: true, className: "font-semibold text-foreground" },
  { key: "symbol", label: "Symbol", sortable: true, render: (i) => <span className="font-mono text-xs font-bold bg-muted/60 px-2 py-0.5 rounded-md">{String(i.symbol)}</span> },
  { key: "quantity", label: "Quantity", sortable: true, className: "font-medium" },
  {
    key: "average_price",
    label: "Avg Price",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (i) => formatCurrency(Number(i.average_price) || 0),
  },
];

const CryptoManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof CRYPTO_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof CRYPTO_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Asset Name</Label>
            <Input
              value={formData.item_name}
              onChange={(e) => set((prev) => ({ ...prev, item_name: e.target.value }))}
              placeholder="e.g. Bitcoin"
            />
          </div>
          <div className="grid gap-2">
            <Label>Symbol</Label>
            <Input
              value={formData.symbol}
              onChange={(e) => set((prev) => ({ ...prev, symbol: e.target.value }))}
              placeholder="e.g. BTC"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              step="0.0001"
              value={formData.quantity}
              onChange={(e) => set((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="0.25"
            />
          </div>
          <div className="grid gap-2">
            <Label>Average Price (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.average_price}
              onChange={(e) => set((prev) => ({ ...prev, average_price: e.target.value }))}
              placeholder="4800000"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Purchase Date</Label>
          <Input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => set((prev) => ({ ...prev, purchase_date: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Description / Wallet Notes</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => set((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Cold storage, exchange name, etc."
            rows={3}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <DataManager
      entity="crypto_investments"
      title="Cryptocurrency"
      description="Track Bitcoin, Ethereum, and other crypto assets."
      icon={<Bitcoin className="h-8 w-8 text-orange-500" />}
      columns={CRYPTO_COLUMNS}
      searchKeys={["item_name", "symbol"]}
      emptyMessage="No crypto investments found."
      defaultFormData={CRYPTO_DEFAULT_FORM}
      hideHeader={true}
      dashboardStyle
      renderForm={renderForm}
    />
  );
});
CryptoManager.displayName = "CryptoManager";

/* ── Bond Config ─────────────────────────────────────────────────── */
const BOND_DEFAULT_FORM = {
  bond_name: "",
  isin: "",
  face_value: "",
  quantity: "",
  coupon_rate: "",
  maturity_date: "",
  purchase_date: "",
};

const BOND_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "bond_name", label: "Bond Name", sortable: true, className: "font-semibold text-foreground" },
  { key: "isin", label: "ISIN", sortable: true, render: (i) => <span className="font-mono text-xs text-muted-foreground">{String(i.isin)}</span> },
  {
    key: "coupon_rate",
    label: "Coupon Rate",
    sortable: true,
    render: (i) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{i.coupon_rate}%</span>,
  },
  {
    key: "maturity_date",
    label: "Maturity",
    sortable: true,
    render: (i) => new Date(String(i.maturity_date)).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  },
];

const BondManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof BOND_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof BOND_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Bond Name</Label>
            <Input
              value={formData.bond_name}
              onChange={(e) => set((prev) => ({ ...prev, bond_name: e.target.value }))}
              placeholder="e.g. NHAI Tax-Free Bond"
            />
          </div>
          <div className="grid gap-2">
            <Label>ISIN</Label>
            <Input
              value={formData.isin}
              onChange={(e) => set((prev) => ({ ...prev, isin: e.target.value }))}
              placeholder="INE..."
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Face Value (₹)</Label>
            <Input
              type="number"
              value={formData.face_value}
              onChange={(e) => set((prev) => ({ ...prev, face_value: e.target.value }))}
              placeholder="1000"
            />
          </div>
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => set((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="100"
            />
          </div>
          <div className="grid gap-2">
            <Label>Coupon Rate %</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.coupon_rate}
              onChange={(e) => set((prev) => ({ ...prev, coupon_rate: e.target.value }))}
              placeholder="8.2"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Purchase Date</Label>
            <Input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => set((prev) => ({ ...prev, purchase_date: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Maturity Date</Label>
            <Input
              type="date"
              value={formData.maturity_date}
              onChange={(e) => set((prev) => ({ ...prev, maturity_date: e.target.value }))}
            />
          </div>
        </div>
      </div>
    ),
    []
  );

  return (
    <DataManager
      entity="bonds"
      title="Bonds"
      description="Track corporate, sovereign gold, and government bonds."
      icon={<LandPlot className="h-8 w-8 text-blue-500" />}
      columns={BOND_COLUMNS}
      searchKeys={["bond_name", "isin"]}
      emptyMessage="No bonds found."
      defaultFormData={BOND_DEFAULT_FORM}
      hideHeader={true}
      dashboardStyle
      renderForm={renderForm}
    />
  );
});
BondManager.displayName = "BondManager";

/* ── ETF Config ──────────────────────────────────────────────────── */
const ETF_DEFAULT_FORM = {
  etf_name: "",
  symbol: "",
  quantity: "",
  purchase_price: "",
  purchase_date: "",
};

const ETF_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "etf_name", label: "ETF Name", sortable: true, className: "font-semibold text-foreground" },
  { key: "symbol", label: "Symbol", sortable: true, render: (i) => <span className="font-mono text-xs font-bold bg-muted/60 px-2 py-0.5 rounded-md">{String(i.symbol)}</span> },
  { key: "quantity", label: "Quantity", sortable: true },
  {
    key: "purchase_price",
    label: "Purchase Price",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (i) => formatCurrency(Number(i.purchase_price) || 0),
  },
];

const EtfManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof ETF_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof ETF_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>ETF Name</Label>
            <Input
              value={formData.etf_name}
              onChange={(e) => set((prev) => ({ ...prev, etf_name: e.target.value }))}
              placeholder="e.g. Nifty BeES"
            />
          </div>
          <div className="grid gap-2">
            <Label>Symbol</Label>
            <Input
              value={formData.symbol}
              onChange={(e) => set((prev) => ({ ...prev, symbol: e.target.value }))}
              placeholder="NIFTYBEES"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => set((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="50"
            />
          </div>
          <div className="grid gap-2">
            <Label>Price per Unit (₹)</Label>
            <Input
              type="number"
              value={formData.purchase_price}
              onChange={(e) => set((prev) => ({ ...prev, purchase_price: e.target.value }))}
              placeholder="250"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Purchase Date</Label>
          <Input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => set((prev) => ({ ...prev, purchase_date: e.target.value }))}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <DataManager
      entity="etfs"
      title="Exchange Traded Funds"
      description="Track your ETF portfolio and index units."
      icon={<MonitorUp className="h-8 w-8 text-emerald-500" />}
      columns={ETF_COLUMNS}
      searchKeys={["etf_name", "symbol"]}
      emptyMessage="No ETFs found."
      defaultFormData={ETF_DEFAULT_FORM}
      hideHeader={true}
      dashboardStyle
      renderForm={renderForm}
    />
  );
});
EtfManager.displayName = "EtfManager";

/* ── NPS Config ──────────────────────────────────────────────────── */
const NPS_DEFAULT_FORM = { pran: "", amount_invested: "", scheme_preference: "" };

const NPS_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "pran", label: "PRAN Number", sortable: true, className: "font-mono font-semibold text-foreground" },
  { key: "scheme_preference", label: "Scheme Preference", sortable: true },
  {
    key: "amount_invested",
    label: "Total Invested",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (i) => formatCurrency(Number(i.amount_invested) || 0),
  },
];

const NpsManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof NPS_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof NPS_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>PRAN Number *</Label>
          <Input
            value={formData.pran}
            onChange={(e) => set((prev) => ({ ...prev, pran: e.target.value }))}
            placeholder="12-digit PRAN"
          />
        </div>
        <div className="grid gap-2">
          <Label>Total Invested (₹) *</Label>
          <Input
            type="number"
            value={formData.amount_invested}
            onChange={(e) => set((prev) => ({ ...prev, amount_invested: e.target.value }))}
            placeholder="250000"
          />
        </div>
        <div className="grid gap-2">
          <Label>Scheme Preference</Label>
          <Input
            value={formData.scheme_preference}
            onChange={(e) => set((prev) => ({ ...prev, scheme_preference: e.target.value }))}
            placeholder="e.g. Auto Choice / Aggressive LC-75"
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <DataManager
      entity="nps_investments"
      title="National Pension System"
      description="Track your Tier I and Tier II NPS retirement investments."
      icon={<PiggyBank className="h-8 w-8 text-violet-500" />}
      columns={NPS_COLUMNS}
      searchKeys={["pran"]}
      emptyMessage="No NPS accounts found."
      defaultFormData={NPS_DEFAULT_FORM}
      hideHeader={true}
      dashboardStyle
      renderForm={renderForm}
    />
  );
});
NpsManager.displayName = "NpsManager";

/* ── Main Component ──────────────────────────────────────────────── */
export default function OtherInvestments() {
  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Other Investments"
        description="Consolidated tracking of Cryptocurrency, Bonds, ETFs, and National Pension Scheme (NPS)"
      />
      <div className="space-y-6">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full sm:max-w-xl grid-cols-2 sm:grid-cols-4 bg-muted p-1 rounded-lg">
            <TabsTrigger value="crypto" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="bonds" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Bonds</TabsTrigger>
            <TabsTrigger value="etfs" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">ETFs</TabsTrigger>
            <TabsTrigger value="nps" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">NPS</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-4">
            <CryptoManager />
          </TabsContent>
          <TabsContent value="bonds" className="mt-4">
            <BondManager />
          </TabsContent>
          <TabsContent value="etfs" className="mt-4">
            <EtfManager />
          </TabsContent>
          <TabsContent value="nps" className="mt-4">
            <NpsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
