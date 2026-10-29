import { memo, useCallback } from "react";
import { DataManager, DataManagerRow } from "@/components/shared/DataManager";
import { ColumnConfig } from "@/components/shared/CommonTable";
import { Landmark, PiggyBank, Briefcase } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetDepreciationCalculator } from "@/components/shared/AssetDepreciationCalculator";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency } from "@/utils/format";

/* ── Bank Account Config ─────────────────────────────────────────── */
const BANK_DEFAULT_FORM = {
  bank_name: "",
  account_type: "savings",
  account_number: "",
  current_balance: "",
  interest_rate: "",
  maturity_date: "",
};

const BANK_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "bank_name", label: "Bank Name", sortable: true, className: "font-semibold text-foreground" },
  {
    key: "account_type",
    label: "Type",
    sortable: true,
    render: (i) => <span className="font-medium">{String(i.account_type).toUpperCase()}</span>,
  },
  {
    key: "current_balance",
    label: "Balance",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (i) => formatCurrency(Number(i.current_balance) || 0),
  },
  {
    key: "interest_rate",
    label: "Interest Rate",
    sortable: true,
    render: (i) => (i.interest_rate ? `${i.interest_rate}%` : "-"),
  },
];

const BankAccountManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof BANK_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof BANK_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Bank Name</Label>
            <Input
              value={formData.bank_name}
              onChange={(e) => set((prev) => ({ ...prev, bank_name: e.target.value }))}
              placeholder="e.g. HDFC Bank"
            />
          </div>
          <div className="grid gap-2">
            <Label>Account Type</Label>
            <Select
              value={formData.account_type}
              onValueChange={(v) => set((prev) => ({ ...prev, account_type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="current">Current Account</SelectItem>
                <SelectItem value="fd">Fixed Deposit (FD)</SelectItem>
                <SelectItem value="rd">Recurring Deposit (RD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Account Number</Label>
            <Input
              type="text"
              value={formData.account_number}
              onChange={(e) => set((prev) => ({ ...prev, account_number: e.target.value }))}
              placeholder="XXXXXXXX1234"
            />
          </div>
          <div className="grid gap-2">
            <Label>Current Balance (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => set((prev) => ({ ...prev, current_balance: e.target.value }))}
              placeholder="250000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Interest Rate % (Optional)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.interest_rate}
              onChange={(e) => set((prev) => ({ ...prev, interest_rate: e.target.value }))}
              placeholder="7.25"
            />
          </div>
          <div className="grid gap-2">
            <Label>Maturity Date (FD/RD)</Label>
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
      entity="bank_accounts"
      title="Bank Accounts & FDs"
      description="Track Savings, Current, FD, and RD balances."
      icon={<Landmark className="h-8 w-8 text-blue-500" />}
      columns={BANK_COLUMNS}
      searchKeys={["bank_name", "account_number"]}
      emptyMessage="No bank accounts found."
      defaultFormData={BANK_DEFAULT_FORM}
      hideHeader={true}
      dashboardStyle
      renderForm={renderForm}
    />
  );
});
BankAccountManager.displayName = "BankAccountManager";

/* ── Provident Fund Config ───────────────────────────────────────── */
const PF_DEFAULT_FORM = {
  fund_type: "EPF",
  current_value: "",
  monthly_contribution: "",
  interest_rate: "",
};

const PF_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "fund_type", label: "Fund Type", sortable: true, className: "font-semibold text-foreground" },
  {
    key: "current_value",
    label: "Current Accumulated Value",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (i) => formatCurrency(Number(i.current_value) || 0),
  },
  {
    key: "monthly_contribution",
    label: "Monthly Contribution",
    sortable: true,
    render: (i) => formatCurrency(Number(i.monthly_contribution) || 0),
  },
];

const ProvidentFundManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof PF_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof PF_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Fund Type</Label>
          <Select
            value={formData.fund_type}
            onValueChange={(v) => set((prev) => ({ ...prev, fund_type: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EPF">Employee Provident Fund (EPF)</SelectItem>
              <SelectItem value="PPF">Public Provident Fund (PPF)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Current Accumulated Value (₹)</Label>
            <Input
              type="number"
              value={formData.current_value}
              onChange={(e) => set((prev) => ({ ...prev, current_value: e.target.value }))}
              placeholder="500000"
            />
          </div>
          <div className="grid gap-2">
            <Label>Monthly Contribution (₹)</Label>
            <Input
              type="number"
              value={formData.monthly_contribution}
              onChange={(e) => set((prev) => ({ ...prev, monthly_contribution: e.target.value }))}
              placeholder="15000"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Interest Rate %</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.interest_rate}
            onChange={(e) => set((prev) => ({ ...prev, interest_rate: e.target.value }))}
            placeholder="8.15"
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <DataManager
      entity="provident_funds"
      title="Provident Funds"
      description="Track Employee (EPF) and Public Provident Funds (PPF)."
      icon={<PiggyBank className="h-8 w-8 text-emerald-500" />}
      columns={PF_COLUMNS}
      searchKeys={["fund_type"]}
      emptyMessage="No provident funds found."
      defaultFormData={PF_DEFAULT_FORM}
      hideHeader={true}
      dashboardStyle
      renderForm={renderForm}
    />
  );
});
ProvidentFundManager.displayName = "ProvidentFundManager";

/* ── Custom Asset Config ─────────────────────────────────────────── */
const CUSTOM_DEFAULT_FORM = {
  asset_name: "",
  asset_type: "vehicle",
  current_value: "",
  purchase_price: "",
  purchase_date: "",
  description: "",
};

const CUSTOM_COLUMNS: ColumnConfig<DataManagerRow>[] = [
  { key: "asset_name", label: "Asset Name", sortable: true, className: "font-semibold text-foreground" },
  {
    key: "asset_type",
    label: "Type",
    sortable: true,
    render: (i) => <span className="font-medium uppercase text-xs">{String(i.asset_type)}</span>,
  },
  {
    key: "purchase_price",
    label: "Purchase Price",
    sortable: true,
    render: (i) => formatCurrency(Number(i.purchase_price) || 0),
  },
  {
    key: "current_value",
    label: "Current Value",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (i) => formatCurrency(Number(i.current_value) || 0),
  },
  {
    key: "appreciation",
    label: "Gain / Loss",
    sortable: false,
    render: (i) => {
      const purchase = Number(i.purchase_price) || 0;
      const current = Number(i.current_value) || 0;
      const diff = current - purchase;
      const percent = purchase > 0 ? ((diff / purchase) * 100).toFixed(2) : 0;
      const isPositive = diff >= 0;
      return (
        <span className={`font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {isPositive ? "+" : ""}{formatCurrency(Math.abs(diff))}
          <span className="text-xs ml-1 opacity-80">({percent}%)</span>
        </span>
      );
    },
  },
];

const CustomAssetManager = memo(() => {
  const renderForm = useCallback(
    (
      formData: typeof CUSTOM_DEFAULT_FORM,
      set: React.Dispatch<React.SetStateAction<typeof CUSTOM_DEFAULT_FORM>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Asset Name</Label>
            <Input
              value={formData.asset_name}
              onChange={(e) => set((prev) => ({ ...prev, asset_name: e.target.value }))}
              placeholder="e.g. BMW 3 Series"
            />
          </div>
          <div className="grid gap-2">
            <Label>Asset Type</Label>
            <Select
              value={formData.asset_type}
              onValueChange={(v) => set((prev) => ({ ...prev, asset_type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicle">Car / Bike / Vehicle</SelectItem>
                <SelectItem value="art">Art & Collectibles</SelectItem>
                <SelectItem value="jewelry">Jewelry (Non-Gold)</SelectItem>
                <SelectItem value="other">Other Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Purchase Price (₹)</Label>
            <Input
              type="number"
              value={formData.purchase_price}
              onChange={(e) => set((prev) => ({ ...prev, purchase_price: e.target.value }))}
              placeholder="4500000"
            />
          </div>
          <div className="grid gap-2">
            <Label>Current Estimated Value (₹)</Label>
            <Input
              type="number"
              value={formData.current_value}
              onChange={(e) => set((prev) => ({ ...prev, current_value: e.target.value }))}
              placeholder="3800000"
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
          <Label>Description / Details</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => set((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Vehicle registration, insurance details, or condition notes..."
            rows={3}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="space-y-6">
      <AssetDepreciationCalculator />
      <DataManager
        entity="custom_assets"
        title="Custom Assets"
        description="Track Vehicles, Art, Collectibles, and other assets."
        icon={<Briefcase className="h-8 w-8 text-amber-500" />}
        columns={CUSTOM_COLUMNS}
        searchKeys={["asset_name", "asset_type"]}
        emptyMessage="No custom assets found."
        defaultFormData={CUSTOM_DEFAULT_FORM}
        hideHeader={true}
        dashboardStyle
        renderForm={renderForm}
      />
    </div>
  );
});
CustomAssetManager.displayName = "CustomAssetManager";

/* ── Main Other Assets Page ───────────────────────────────────────── */
export default function OtherAssets() {
  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Other Assets"
        description="Consolidated tracking of Bank Accounts, FDs, PPF, EPF, and Custom Valuable Assets"
      />
      <div className="space-y-6">
        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full sm:max-w-md grid-cols-3 bg-muted p-1 rounded-lg">
            <TabsTrigger value="bank" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Bank & FDs</TabsTrigger>
            <TabsTrigger value="provident" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Provident Funds</TabsTrigger>
            <TabsTrigger value="custom" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Custom Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="mt-4">
            <BankAccountManager />
          </TabsContent>
          <TabsContent value="provident" className="mt-4">
            <ProvidentFundManager />
          </TabsContent>
          <TabsContent value="custom" className="mt-4">
            <CustomAssetManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
