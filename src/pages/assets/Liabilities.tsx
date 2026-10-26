import { memo, useCallback } from "react";
import { DataManager } from "@/components/shared/DataManager";
import { Banknote } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ColumnConfig } from "@/components/shared/CommonTable";

interface LiabilityItem {
  id: string;
  liability_name: string;
  liability_type: string;
  outstanding_amount: string | number;
  interest_rate: string | number;
  monthly_payment: string | number;
  lender: string;
  status: string;
}

const DEFAULT_FORM_DATA = {
  liability_name: "",
  liability_type: "personal",
  principal_amount: "",
  outstanding_amount: "",
  interest_rate: "",
  monthly_payment: "",
  start_date: "",
  end_date: "",
  lender: "",
  status: "active",
  description: "",
};

const LIABILITY_TYPES = [
  { label: "Home Loan", value: "home" },
  { label: "Car Loan", value: "car" },
  { label: "Personal Loan", value: "personal" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Education Loan", value: "education" },
  { label: "Other", value: "other" },
];

const STATUS_FILTERS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paid Off", value: "paid" },
  { label: "Defaulted", value: "defaulted" },
];

const SEARCH_KEYS: (keyof LiabilityItem)[] = ["liability_name", "lender"];

const COLUMNS: ColumnConfig<LiabilityItem>[] = [
  { key: "liability_name", label: "Liability Name", sortable: true, className: "font-semibold text-foreground" },
  {
    key: "liability_type",
    label: "Type",
    sortable: true,
    render: (item) =>
      LIABILITY_TYPES.find((t) => t.value === item.liability_type)?.label || item.liability_type,
  },
  {
    key: "outstanding_amount",
    label: "Outstanding",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (item) => `₹${Number(item.outstanding_amount).toLocaleString("en-IN")}`,
  },
  {
    key: "interest_rate",
    label: "Interest",
    sortable: true,
    render: (item) => `${item.interest_rate}%`,
  },
  {
    key: "monthly_payment",
    label: "Monthly EMI",
    sortable: true,
    render: (item) => `₹${Number(item.monthly_payment).toLocaleString("en-IN")}`,
  },
  { key: "lender", label: "Lender / Bank", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (item) => (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          item.status === "active"
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        }`}
      >
        {item.status.toUpperCase()}
      </span>
    ),
  },
];

const Liabilities = () => {
  const renderForm = useCallback(
    (
      formData: typeof DEFAULT_FORM_DATA,
      setFormData: React.Dispatch<React.SetStateAction<typeof DEFAULT_FORM_DATA>>
    ) => (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Liability Name *</Label>
            <Input
              value={formData.liability_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, liability_name: e.target.value }))}
              placeholder="e.g. HDFC Home Loan"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Liability Type</Label>
            <Select
              value={formData.liability_type}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, liability_type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIABILITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Principal Amount (₹) *</Label>
            <Input
              type="number"
              value={formData.principal_amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, principal_amount: e.target.value }))}
              placeholder="5000000"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Outstanding Amount (₹) *</Label>
            <Input
              type="number"
              value={formData.outstanding_amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, outstanding_amount: e.target.value }))}
              placeholder="4200000"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Interest Rate (% p.a.)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.interest_rate}
              onChange={(e) => setFormData((prev) => ({ ...prev, interest_rate: e.target.value }))}
              placeholder="8.5"
            />
          </div>
          <div className="grid gap-2">
            <Label>Monthly Payment / EMI (₹)</Label>
            <Input
              type="number"
              value={formData.monthly_payment}
              onChange={(e) => setFormData((prev) => ({ ...prev, monthly_payment: e.target.value }))}
              placeholder="45000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Lender / Financial Institution</Label>
            <Input
              value={formData.lender}
              onChange={(e) => setFormData((prev) => ({ ...prev, lender: e.target.value }))}
              placeholder="e.g. State Bank of India"
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.filter((f) => f.value !== "all").map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Loan terms, foreclosure details, or account number..."
            rows={3}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <DataManager
        entity="liabilities"
        title="Liabilities & Loans"
        description="Track and manage all liabilities including home loans, auto financing, personal debts, and cards"
        icon={<Banknote className="h-8 w-8 text-rose-500" />}
        columns={COLUMNS}
        searchKeys={SEARCH_KEYS}
        emptyMessage="No liabilities found. Add your first liability!"
        defaultFormData={DEFAULT_FORM_DATA}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={STATUS_FILTERS}
      />
    </div>
  );
};

export default memo(Liabilities);
