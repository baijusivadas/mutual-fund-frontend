import { memo, useCallback } from "react";
import { Building2 } from "lucide-react";
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
import { realEstateStatusFilters, propertyTypeOptions } from "@/data/filterOptions";
import { ColumnConfig, StatusBadge } from "@/components/shared/CommonTable";

interface RealEstateItem {
  id: string;
  property_name: string;
  location: string;
  price: number;
  area: number;
  property_type: string;
  status: string;
  description: string | null;
  created_at: string;
}

const DEFAULT_FORM_DATA = {
  property_name: "",
  location: "",
  price: "",
  area: "",
  property_type: "residential",
  status: "available",
  description: "",
};

const SEARCH_KEYS: (keyof RealEstateItem)[] = ["property_name", "location"];

const COLUMNS: ColumnConfig<RealEstateItem>[] = [
  { key: "property_name", label: "Property Name", sortable: true, className: "font-semibold text-foreground" },
  { key: "location", label: "Location", sortable: true },
  {
    key: "property_type",
    label: "Type",
    sortable: true,
    render: (item) => <span className="capitalize font-medium">{item.property_type}</span>,
  },
  {
    key: "price",
    label: "Price",
    sortable: true,
    className: "font-extrabold text-foreground",
    render: (item) => `₹${Number(item.price).toLocaleString("en-IN")}`,
  },
  {
    key: "area",
    label: "Area",
    sortable: true,
    render: (item) => `${Number(item.area).toLocaleString()} sq ft`,
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
  price: parseFloat(data.price),
  area: parseFloat(data.area),
});

const RealEstate = () => {
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
            placeholder="e.g., Sunset Villa"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Mumbai, Maharashtra"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="5000000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="area">Area (sq ft) *</Label>
            <Input
              id="area"
              type="number"
              value={formData.area}
              onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="1200"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="property_type">Property Type *</Label>
            <Select
              value={formData.property_type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, property_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {propertyTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {realEstateStatusFilters
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
      <DataManager<RealEstateItem, typeof DEFAULT_FORM_DATA>
        entity="real_estate"
        title="Real Estate Management"
        description="Manage your complete real estate properties and land investments inventory"
        icon={<Building2 className="h-8 w-8 text-primary" />}
        columns={COLUMNS}
        searchKeys={SEARCH_KEYS}
        emptyMessage="No properties found. Add your first property!"
        defaultFormData={DEFAULT_FORM_DATA}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={realEstateStatusFilters}
        transformPayload={transformPayload}
      />
    </div>
  );
};

export default memo(RealEstate);
