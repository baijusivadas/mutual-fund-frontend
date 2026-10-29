import { memo, useCallback } from "react";
import { Coins } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { goldStatusFilters, purityOptions } from "@/data/filterOptions";
import { ColumnConfig, StatusBadge } from "@/components/shared/CommonTable";
import { formatCurrency } from "@/utils/format";

interface Gold {
  id: string;
  item_name: string;
  weight: number;
  purity: string;
  price: number;
  purchase_date: string;
  status: string;
  description: string | null;
  created_at: string;
}

const DEFAULT_FORM_DATA = {
  item_name: "",
  weight: "",
  purity: "24K",
  price: "",
  purchase_date: "",
  status: "in_stock",
  description: "",
};

const SEARCH_KEYS: (keyof Gold)[] = ["item_name"];

const COLUMNS: ColumnConfig<Gold>[] = [
  { key: "item_name", label: "Item Name", sortable: true, className: "font-semibold text-foreground" },
  { key: "weight", label: "Weight", sortable: true, render: (item) => `${item.weight}g` },
  { key: "purity", label: "Purity", sortable: true, className: "font-medium" },
  {
    key: "price",
    label: "Price",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (item) => formatCurrency(Number(item.price)),
  },
  {
    key: "purchase_date",
    label: "Purchase Date",
    sortable: true,
    render: (item) => new Date(item.purchase_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (item) => <StatusBadge status={item.status} />,
  },
];

const transformPayload = (data: typeof DEFAULT_FORM_DATA) => ({
  ...data,
  weight: parseFloat(data.weight),
  price: parseFloat(data.price),
});

const Gold = () => {
  const renderForm = useCallback(
    (
      formData: typeof DEFAULT_FORM_DATA,
      setFormData: React.Dispatch<React.SetStateAction<typeof DEFAULT_FORM_DATA>>
    ) => (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="item_name">Item Name *</Label>
          <Input
            id="item_name"
            value={formData.item_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, item_name: e.target.value }))}
            placeholder="e.g., Gold Bar, Gold Coin"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight (grams) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
              placeholder="10.5"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purity">Purity *</Label>
            <Select
              value={formData.purity}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, purity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {purityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="55000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purchase_date">Purchase Date *</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {goldStatusFilters
                .filter((f) => f.value !== "all")
                .map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Additional item details..."
            rows={4}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <DataManager<Gold, typeof DEFAULT_FORM_DATA>
        entity="gold"
        title="Gold Inventory Management"
        description="Track physical gold holdings, coins, jewelry, and bullion investments"
        icon={<Coins className="h-8 w-8 text-amber-500" />}
        columns={COLUMNS}
        searchKeys={SEARCH_KEYS}
        emptyMessage="No gold items found. Add your first item!"
        defaultFormData={DEFAULT_FORM_DATA}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={goldStatusFilters}
        transformPayload={transformPayload}
      />
    </div>
  );
};

export default memo(Gold);
