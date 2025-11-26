import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { usePropertyData } from "../hooks/usePropertyData";
import { AdvancedSearchFilters } from "../components/AdvancedSearchFilters";
import { BulkActionBar } from "../components/BulkActionBar";
import { PaginationControls } from "@/components/PaginationControls";
import type { RentalProperty } from "@/types";
import { DashboardLayout } from "@/components/DashboardLayout";

const RentalProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<RentalProperty | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: properties, isLoading, deleteItem, bulkDelete, bulkStatusUpdate, createItem, updateItem } = 
    usePropertyData<RentalProperty>("rental_properties", "rental_properties");

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

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (property.tenant_name && property.tenant_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      const matchesMinPrice = minPrice === undefined || property.monthly_rent >= minPrice;
      const matchesMaxPrice = maxPrice === undefined || property.monthly_rent <= maxPrice;
      return matchesSearch && matchesStatus && matchesMinPrice && matchesMaxPrice;
    });
  }, [properties, searchQuery, statusFilter, minPrice, maxPrice]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProperties.slice(startIndex, startIndex + pageSize);
  }, [filteredProperties, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProperties.length / pageSize);

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

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedProperties.map(p => p.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  };

  const handleBulkDelete = () => {
    bulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkStatusUpdate = (status: string) => {
    bulkStatusUpdate({ ids: selectedIds, status });
    setSelectedIds([]);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "rented", label: "Rented" },
    { value: "maintenance", label: "Maintenance" },
  ];

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
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rental Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProperty ? "Edit Rental Property" : "Add New Rental Property"}</DialogTitle>
                  <DialogDescription>
                    {editingProperty ? "Update rental property details" : "Add a new rental property to your inventory"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="property_name">Property Name *</Label>
                    <Input
                      id="property_name"
                      value={formData.property_name}
                      onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                      placeholder="e.g., Green View Apartment"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                        placeholder="45000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deposit">Security Deposit (₹) *</Label>
                      <Input
                        id="deposit"
                        type="number"
                        value={formData.deposit}
                        onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        placeholder="3"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bathrooms">Bathrooms *</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        placeholder="2"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="area">Area (sq ft) *</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="1100"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenant_name">Tenant Name</Label>
                    <Input
                      id="tenant_name"
                      value={formData.tenant_name}
                      onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                      placeholder="Current tenant name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="lease_start_date">Lease Start Date</Label>
                      <Input
                        id="lease_start_date"
                        type="date"
                        value={formData.lease_start_date}
                        onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lease_end_date">Lease End Date</Label>
                      <Input
                        id="lease_end_date"
                        type="date"
                        value={formData.lease_end_date}
                        onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })}
                      />
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>
                    {editingProperty ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <AdvancedSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={statusOptions}
            showPriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />

          <BulkActionBar
            selectedCount={selectedIds.length}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            statusOptions={statusOptions.filter(opt => opt.value !== "all")}
            onClearSelection={() => setSelectedIds([])}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === paginatedProperties.length && paginatedProperties.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Config</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all" ? "No properties match your filters" : "No rental properties found. Add your first property!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(property.id)}
                          onCheckedChange={(checked) => handleSelectItem(property.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{property.property_name}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>{property.bedrooms}BHK, {property.bathrooms} Bath</TableCell>
                      <TableCell>₹{property.monthly_rent.toLocaleString('en-IN')}/mo</TableCell>
                      <TableCell>{property.tenant_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          property.status === 'available' ? 'default' :
                          property.status === 'rented' ? 'secondary' : 'outline'
                        } className="capitalize">
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(property)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete <strong>{property.property_name}</strong>. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteItem(property.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredProperties.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
      </DashboardLayout>
  );
};

export default RentalProperties;