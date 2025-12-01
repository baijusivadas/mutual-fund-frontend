import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Home } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePropertyData } from "@/hooks/usePropertyData";
import { CommonTable, ColumnConfig, StatusBadge } from "@/components/CommonTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { flatStatusFilters } from "@/data/filterOptions";
import type { Flat } from "@/types";

const Flats = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);

  const { data: flats, isLoading, deleteItem, bulkDelete, bulkStatusUpdate, createItem, updateItem } = 
    usePropertyData<Flat>("flats", "flats");

  const [formData, setFormData] = useState({
    flat_name: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    status: "available",
    description: "",
  });

  const handleSubmit = () => {
    const payload = {
      flat_name: formData.flat_name,
      location: formData.location,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      area: parseFloat(formData.area),
      floor: formData.floor ? parseInt(formData.floor) : null,
      status: formData.status,
      description: formData.description || null,
    };

    if (editingFlat) {
      updateItem({ id: editingFlat.id, payload });
    } else {
      createItem(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      flat_name: "",
      location: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      floor: "",
      status: "available",
      description: "",
    });
    setEditingFlat(null);
  };

  const openEditDialog = (flat: Flat) => {
    setEditingFlat(flat);
    setFormData({
      flat_name: flat.flat_name,
      location: flat.location,
      price: flat.price.toString(),
      bedrooms: flat.bedrooms.toString(),
      bathrooms: flat.bathrooms.toString(),
      area: flat.area.toString(),
      floor: flat.floor?.toString() || "",
      status: flat.status,
      description: flat.description || "",
    });
    setDialogOpen(true);
  };

  const columns: ColumnConfig<Flat>[] = [
    { key: "flat_name", label: "Flat Name", sortable: true, className: "font-medium" },
    { key: "location", label: "Location", sortable: true },
    { key: "bedrooms", label: "Config", sortable: false, render: (item) => `${item.bedrooms}BHK, ${item.bathrooms} Bath` },
    { key: "area", label: "Area", sortable: true, render: (item) => `${item.area.toLocaleString()} sq ft` },
    { key: "floor", label: "Floor", sortable: true, render: (item) => item.floor ? `${item.floor}th` : 'N/A' },
    { key: "price", label: "Price", sortable: true, render: (item) => `₹${item.price.toLocaleString('en-IN')}` },
    { key: "status", label: "Status", sortable: true, render: (item) => <StatusBadge status={item.status} /> },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Home className="h-8 w-8" />
                Flats Management
              </CardTitle>
              <CardDescription>Manage your residential flats inventory</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Add Flat</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFlat ? "Edit Flat" : "Add New Flat"}</DialogTitle>
                  <DialogDescription>{editingFlat ? "Update flat details" : "Add a new flat to your inventory"}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingFlat ? "Update" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <CommonTable
            data={flats}
            columns={columns}
            onEdit={openEditDialog}
            onDelete={deleteItem}
            onBulkDelete={bulkDelete}
            onBulkStatusUpdate={(ids, status) => bulkStatusUpdate({ ids, status })}
            searchPlaceholder="Search by name or location..."
            searchKeys={["flat_name", "location"]}
            statusKey="status"
            statusFilters={flatStatusFilters}
            emptyMessage="No flats found. Add your first flat!"
            showBulkActions
            showCheckboxes
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Flats;
