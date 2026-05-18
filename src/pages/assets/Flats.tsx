import { Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataManager } from "@/components/shared/DataManager";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flatStatusFilters } from "@/data/filterOptions";
import { ColumnConfig, StatusBadge } from "@/components/shared/CommonTable";

interface Flat {
  id: string;
  flat_name: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number | null;
  status: string;
  description: string | null;
}

const Flats = () => {
  const columns: ColumnConfig<Flat>[] = [
    { key: "flat_name", label: "Flat Name", sortable: true, className: "font-medium" },
    { key: "location", label: "Location", sortable: true },
    { key: "bedrooms", label: "Config", sortable: false, render: (item) => `${item.bedrooms}BHK, ${item.bathrooms} Bath` },
    { key: "area", label: "Area", sortable: true, render: (item) => `${item.area.toLocaleString()} sq ft` },
    { key: "floor", label: "Floor", sortable: true, render: (item) => item.floor ? `${item.floor}th` : 'N/A' },
    { key: "price", label: "Price", sortable: true, render: (item) => `₹${Number(item.price).toLocaleString('en-IN')}` },
    { key: "status", label: "Status", sortable: true, render: (item) => <StatusBadge status={item.status} /> },
  ];

  const defaultFormData = {
    flat_name: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    status: "available",
    description: "",
  };

  const renderForm = (formData: any, setFormData: (data: any) => void) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="flat_name">Flat Name *</Label>
        <Input id="flat_name" value={formData.flat_name} onChange={(e) => setFormData({ ...formData, flat_name: e.target.value })} placeholder="e.g., Sunny Apartment 3B" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location *</Label>
        <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Andheri West, Mumbai" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="8500000" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Area (sq ft) *</Label>
          <Input id="area" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="950" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bedrooms">Bedrooms *</Label>
          <Input id="bedrooms" type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} placeholder="2" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bathrooms">Bathrooms *</Label>
          <Input id="bathrooms" type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} placeholder="2" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="floor">Floor</Label>
          <Input id="floor" type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} placeholder="5" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {flatStatusFilters.filter(f => f.value !== 'all').map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional flat details..." rows={4} />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <DataManager<Flat>
        entity="flats"
        title="Flats Management"
        description="Manage your residential flats inventory"
        icon={<Building2 className="h-8 w-8" />}
        columns={columns}
        searchKeys={["flat_name", "location"]}
        emptyMessage="No flats found. Add your first flat!"
        defaultFormData={defaultFormData}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={flatStatusFilters}
        transformPayload={(data) => ({
          ...data,
          price: parseFloat(data.price),
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          area: parseFloat(data.area),
          floor: data.floor ? parseInt(data.floor) : null,
        })}
      />
    </DashboardLayout>
  );
};

export default Flats;
