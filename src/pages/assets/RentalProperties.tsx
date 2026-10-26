import { memo, useCallback } from "react";
import { KeyRound } from "lucide-react";
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
import { rentalStatusFilters } from "@/data/filterOptions";
import { ColumnConfig, StatusBadge } from "@/components/shared/CommonTable";

interface RentalProperty {
  id: string;
  property_name: string;
  location: string;
  monthly_rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  tenant_name: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  description: string | null;
}

const DEFAULT_FORM_DATA = {
  property_name: "",
  location: "",
  monthly_rent: "",
  deposit: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  status: "available",
  tenant_name: "",
  lease_start_date: "",
  lease_end_date: "",
  description: "",
};

const SEARCH_KEYS: (keyof RentalProperty)[] = ["property_name", "location", "tenant_name"];

const COLUMNS: ColumnConfig<RentalProperty>[] = [
  { key: "property_name", label: "Property Name", sortable: true, className: "font-semibold text-foreground" },
  { key: "location", label: "Location", sortable: true },
  {
    key: "bedrooms",
    label: "Config",
    sortable: false,
    render: (item) => <span className="font-medium">{`${item.bedrooms}BHK, ${item.bathrooms} Bath`}</span>,
  },
  {
    key: "monthly_rent",
    label: "Monthly Rent",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (item) => `₹${Number(item.monthly_rent).toLocaleString("en-IN")}/mo`,
  },
  {
    key: "tenant_name",
    label: "Tenant",
    sortable: true,
    render: (item) => item.tenant_name || <span className="text-muted-foreground">-</span>,
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
  monthly_rent: parseFloat(data.monthly_rent),
  deposit: parseFloat(data.deposit),
  bedrooms: parseInt(data.bedrooms),
  bathrooms: parseInt(data.bathrooms),
  area: parseFloat(data.area),
  tenant_name: data.tenant_name || null,
  lease_start_date: data.lease_start_date || null,
  lease_end_date: data.lease_end_date || null,
});

const RentalProperties = () => {
  const renderForm = useCallback(
    (
      formData: typeof DEFAULT_FORM_DATA,
      setFormData: React.Dispatch<React.SetStateAction<typeof DEFAULT_FORM_DATA>>
    ) => (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="property_name">Property Name *</Label>
          <Input
            id="property_name"
            value={formData.property_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, property_name: e.target.value }))}
            placeholder="e.g., Green View Apartment"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Bandra, Mumbai"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="monthly_rent">Monthly Rent (₹) *</Label>
            <Input
              id="monthly_rent"
              type="number"
              value={formData.monthly_rent}
              onChange={(e) => setFormData((prev) => ({ ...prev, monthly_rent: e.target.value }))}
              placeholder="35000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deposit">Security Deposit (₹) *</Label>
            <Input
              id="deposit"
              type="number"
              value={formData.deposit}
              onChange={(e) => setFormData((prev) => ({ ...prev, deposit: e.target.value }))}
              placeholder="100000"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bedrooms">Bedrooms *</Label>
            <Input
              id="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData((prev) => ({ ...prev, bedrooms: e.target.value }))}
              placeholder="2"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bathrooms">Bathrooms *</Label>
            <Input
              id="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))}
              placeholder="2"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="area">Area (sq ft) *</Label>
            <Input
              id="area"
              type="number"
              value={formData.area}
              onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="850"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant_name">Tenant Name</Label>
            <Input
              id="tenant_name"
              value={formData.tenant_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, tenant_name: e.target.value }))}
              placeholder="John Doe"
            />
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
                {rentalStatusFilters
                  .filter((f) => f.value !== "all")
                  .map((opt) => (
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
            <Label htmlFor="lease_start_date">Lease Start Date</Label>
            <Input
              id="lease_start_date"
              type="date"
              value={formData.lease_start_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, lease_start_date: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lease_end_date">Lease End Date</Label>
            <Input
              id="lease_end_date"
              type="date"
              value={formData.lease_end_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, lease_end_date: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Additional property details..."
            rows={4}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <DataManager<RentalProperty, typeof DEFAULT_FORM_DATA>
        entity="rental_properties"
        title="Rental Properties Management"
        description="Manage your rental properties, leases, tenant agreements, and monthly cashflows"
        icon={<KeyRound className="h-8 w-8 text-indigo-500" />}
        columns={COLUMNS}
        searchKeys={SEARCH_KEYS}
        emptyMessage="No rental properties found. Add your first property!"
        defaultFormData={DEFAULT_FORM_DATA}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={rentalStatusFilters}
        transformPayload={transformPayload}
      />
    </div>
  );
};

export default memo(RentalProperties);
