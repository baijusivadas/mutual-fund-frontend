import { KeyRound } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataManager } from "@/components/shared/DataManager";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const RentalProperties = () => {
  const columns: ColumnConfig<RentalProperty>[] = [
    { key: "property_name", label: "Property Name", sortable: true, className: "font-medium" },
    { key: "location", label: "Location", sortable: true },
    { key: "bedrooms", label: "Config", sortable: false, render: (item) => `${item.bedrooms}BHK, ${item.bathrooms} Bath` },
    { key: "monthly_rent", label: "Monthly Rent", sortable: true, render: (item) => `₹${Number(item.monthly_rent).toLocaleString('en-IN')}/mo` },
    { key: "tenant_name", label: "Tenant", sortable: true, render: (item) => item.tenant_name || '-' },
    { key: "status", label: "Status", sortable: true, render: (item) => <StatusBadge status={item.status} /> },
  ];

  const defaultFormData = {
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

  const renderForm = (formData: any, setFormData: (data: any) => void) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="property_name">Property Name *</Label>
        <Input id="property_name" value={formData.property_name} onChange={(e) => setFormData({ ...formData, property_name: e.target.value })} placeholder="e.g., Green View Apartment" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location *</Label>
        <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Bandra, Mumbai" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="monthly_rent">Monthly Rent (₹) *</Label>
          <Input id="monthly_rent" type="number" value={formData.monthly_rent} onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })} placeholder="45000" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deposit">Security Deposit (₹) *</Label>
          <Input id="deposit" type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} placeholder="135000" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bedrooms">Bedrooms *</Label>
          <Input id="bedrooms" type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} placeholder="3" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bathrooms">Bathrooms *</Label>
          <Input id="bathrooms" type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} placeholder="2" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Area (sq ft) *</Label>
          <Input id="area" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="1100" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {rentalStatusFilters.filter(f => f.value !== 'all').map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tenant_name">Tenant Name</Label>
        <Input id="tenant_name" value={formData.tenant_name} onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })} placeholder="Current tenant name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="lease_start_date">Lease Start Date</Label>
          <Input id="lease_start_date" type="date" value={formData.lease_start_date} onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lease_end_date">Lease End Date</Label>
          <Input id="lease_end_date" type="date" value={formData.lease_end_date} onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional property details..." rows={4} />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <DataManager<RentalProperty>
        entity="rental_properties"
        title="Rental Properties Management"
        description="Manage your rental properties and tenant leases"
        icon={<KeyRound className="h-8 w-8" />}
        columns={columns}
        searchKeys={["property_name", "location", "tenant_name"]}
        emptyMessage="No rental properties found. Add your first property!"
        defaultFormData={defaultFormData}
        renderForm={renderForm}
        statusKey="status"
        statusFilters={rentalStatusFilters}
        transformPayload={(data) => ({
          ...data,
          monthly_rent: parseFloat(data.monthly_rent),
          deposit: parseFloat(data.deposit),
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          area: parseFloat(data.area),
          tenant_name: data.tenant_name || null,
          lease_start_date: data.lease_start_date || null,
          lease_end_date: data.lease_end_date || null,
        })}
      />
    </DashboardLayout>
  );
};

export default RentalProperties;
