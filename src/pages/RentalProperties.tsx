import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { usePropertyData } from "@/hooks/usePropertyData";
import {
  CommonTable,
  ColumnConfig,
  StatusBadge,
} from "../components/CommonTable";
import type { RentalProperty } from "@/types";
import { DashboardLayout } from "@/components/DashboardLayout";

const RentalProperties = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<RentalProperty | null>(
    null
  );

  const {
    data: properties,
    isLoading,
    deleteItem,
    bulkDelete,
    bulkStatusUpdate,
    createItem,
    updateItem,
  } = usePropertyData<RentalProperty>("rental_properties", "rental_properties");

  const [formData, setFormData] = useState({
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
  });

  const handleSubmit = () => {
    const payload = {
      property_name: formData.property_name,
      location: formData.location,
      monthly_rent: parseFloat(formData.monthly_rent),
      deposit: parseFloat(formData.deposit),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area: parseFloat(formData.area),
      status: formData.status,
      tenant_name: formData.tenant_name || null,
      lease_start_date: formData.lease_start_date || null,
      lease_end_date: formData.lease_end_date || null,
      description: formData.description || null,
    };

    if (editingProperty) {
      updateItem({ id: editingProperty.id, payload });
    } else {
      createItem(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
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
    });
    setEditingProperty(null);
  };

  const openEditDialog = (property: RentalProperty) => {
    setEditingProperty(property);
    setFormData({
      property_name: property.property_name,
      location: property.location,
      monthly_rent: property.monthly_rent.toString(),
      deposit: property.deposit.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      status: property.status,
      tenant_name: property.tenant_name || "",
      lease_start_date: property.lease_start_date || "",
      lease_end_date: property.lease_end_date || "",
      description: property.description || "",
    });
    setDialogOpen(true);
  };

  const columns: ColumnConfig<RentalProperty>[] = [
    {
      key: "property_name",
      label: "Property Name",
      sortable: true,
      className: "font-medium",
    },
    { key: "location", label: "Location", sortable: true },
    {
      key: "bedrooms",
      label: "Config",
      sortable: false,
      render: (item) => `${item.bedrooms}BHK, ${item.bathrooms} Bath`,
    },
    {
      key: "monthly_rent",
      label: "Monthly Rent",
      sortable: true,
      render: (item) => `₹${item.monthly_rent.toLocaleString("en-IN")}/mo`,
    },
    {
      key: "tenant_name",
      label: "Tenant",
      sortable: true,
      render: (item) => item.tenant_name || "-",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <KeyRound className="h-8 w-8" />
                  Rental Properties Management
                </CardTitle>
                <CardDescription>
                  Manage your rental properties and tenant leases
                </CardDescription>
              </div>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rental Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProperty
                        ? "Edit Rental Property"
                        : "Add New Rental Property"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProperty
                        ? "Update rental property details"
                        : "Add a new rental property to your inventory"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="property_name">Property Name *</Label>
                      <Input
                        id="property_name"
                        value={formData.property_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            property_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Green View Apartment"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              monthly_rent: e.target.value,
                            })
                          }
                          placeholder="45000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="deposit">Security Deposit (₹) *</Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={formData.deposit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deposit: e.target.value,
                            })
                          }
                          placeholder="135000"
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bedrooms: e.target.value,
                            })
                          }
                          placeholder="3"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bathrooms">Bathrooms *</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bathrooms: e.target.value,
                            })
                          }
                          placeholder="2"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="area">Area (sq ft) *</Label>
                        <Input
                          id="area"
                          type="number"
                          value={formData.area}
                          onChange={(e) =>
                            setFormData({ ...formData, area: e.target.value })
                          }
                          placeholder="1100"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tenant_name">Tenant Name</Label>
                      <Input
                        id="tenant_name"
                        value={formData.tenant_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tenant_name: e.target.value,
                          })
                        }
                        placeholder="Current tenant name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="lease_start_date">
                          Lease Start Date
                        </Label>
                        <Input
                          id="lease_start_date"
                          type="date"
                          value={formData.lease_start_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lease_start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lease_end_date">Lease End Date</Label>
                        <Input
                          id="lease_end_date"
                          type="date"
                          value={formData.lease_end_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lease_end_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Additional property details..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingProperty ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <CommonTable
              data={properties}
              columns={columns}
              onEdit={openEditDialog}
              onDelete={deleteItem}
              onBulkDelete={bulkDelete}
              onBulkStatusUpdate={(ids, status) =>
                bulkStatusUpdate({ ids, status })
              }
              searchPlaceholder="Search by name, location, or tenant..."
              searchKeys={["property_name", "location", "tenant_name"]}
              statusKey="status"
              statusFilters={[
                { value: "all", label: "All Status" },
                { value: "available", label: "Available" },
                { value: "rented", label: "Rented" },
                { value: "maintenance", label: "Maintenance" },
              ]}
              emptyMessage="No rental properties found. Add your first property!"
              showBulkActions
              showCheckboxes
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RentalProperties;
