import { Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataManager } from "@/components/shared/DataManager";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { realEstateStatusFilters, propertyTypeFilters } from "@/data/filterOptions";
import { ColumnConfig, StatusBadge } from "@/components/CommonTable";

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

const RealEstate = () => {
  const columns: ColumnConfig<RealEstateItem>[] = [
    { key: "property_name", label: "Property Name", sortable: true, className: "font-medium" },
    { key: "location", label: "Location", sortable: true },
    { key: "property_type", label: "Type", sortable: true, render: (item) => <span className="capitalize">{item.property_type}</span> },
    { key: "price", label: "Price", sortable: true, render: (item) => `₹${Number(item.price).toLocaleString('en-IN')}` },
    { key: "area", label: "Area", sortable: true, render: (item) => `${Number(item.area).toLocaleString()} sq ft` },
    { key: "status", label: "Status", sortable: true, render: (item) => <StatusBadge status={item.status} /> },
  ];

  const defaultFormData = {
    property_name: "",
    location: "",
    price: "",
    area: "",
    property_type: "residential",
    status: "available",
    description: "",
  };

  const renderForm = (formData: any, setFormData: (data: any) => void) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="property_name">Property Name *</Label>
        <Input
          id="property_name"
          value={formData.property_name}
          onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
          placeholder="e.g., Sunset Villa"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="5000000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Area (sq ft) *</Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            placeholder="1200"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="property_type">Property Type *</Label>
          <Select
            value={formData.property_type}
            onValueChange={(value) => setFormData({ ...formData, property_type: value })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              {propertyTypeFilters.filter(f => f.value !== 'all').map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {realEstateStatusFilters.filter(f => f.value !== 'all').map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional property details..."
          rows={4}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <DataManager<RealEstateItem>
        entity="real_estate"
        title="Real Estate Management"
        description="Manage your real estate properties inventory"
        icon={<Building2 className="h-8 w-8" />}
        columns={columns}
        searchKeys={["property_name", "location"]}
        emptyMessage="No properties found. Add your first property!"
        defaultFormData={defaultFormData}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={realEstateStatusFilters}
        transformPayload={(data) => ({
          ...data,
          price: parseFloat(data.price),
          area: parseFloat(data.area),
        })}
      />
    </DashboardLayout>
  );
};

export default RealEstate;

