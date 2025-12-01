import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyQueryConfig } from "@/hooks/useQueryConfig";
import { CommonTable, ColumnConfig, StatusBadge } from "@/components/CommonTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { realEstateStatusFilters, propertyTypeFilters } from "../data/filterOptions";
import { DashboardLayout } from "@/components/DashboardLayout";

interface RealEstate {
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<RealEstate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    property_name: "",
    location: "",
    price: "",
    area: "",
    property_type: "residential",
    status: "available",
    description: "",
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['real_estate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('real_estate')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    ...propertyQueryConfig,
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingProperty) {
        const { error } = await supabase.from('real_estate').update(payload).eq('id', editingProperty.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('real_estate').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real_estate'] });
      toast({ title: editingProperty ? "Property updated" : "Property created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      property_name: formData.property_name,
      location: formData.location,
      price: parseFloat(formData.price),
      area: parseFloat(formData.area),
      property_type: formData.property_type,
      status: formData.status,
      description: formData.description || null,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const { error } = await supabase.from('real_estate').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['real_estate'] });
      toast({ title: "Property deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      property_name: "",
      location: "",
      price: "",
      area: "",
      property_type: "residential",
      status: "available",
      description: "",
    });
    setEditingProperty(null);
  };

  const openEditDialog = (property: RealEstate) => {
    setEditingProperty(property);
    setFormData({
      property_name: property.property_name,
      location: property.location,
      price: property.price.toString(),
      area: property.area.toString(),
      property_type: property.property_type,
      status: property.status,
      description: property.description || "",
    });
    setDialogOpen(true);
  };

  const columns: ColumnConfig<RealEstate>[] = [
    { key: "property_name", label: "Property Name", sortable: true, className: "font-medium" },
    { key: "location", label: "Location", sortable: true },
    { key: "property_type", label: "Type", sortable: true, render: (item) => <span className="capitalize">{item.property_type}</span> },
    { key: "price", label: "Price", sortable: true, render: (item) => `₹${item.price.toLocaleString('en-IN')}` },
    { key: "area", label: "Area", sortable: true, render: (item) => `${item.area.toLocaleString()} sq ft` },
    { key: "status", label: "Status", sortable: true, render: (item) => <StatusBadge status={item.status} /> },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Real Estate Management
              </CardTitle>
              <CardDescription>Manage your real estate properties inventory</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Add Property</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
                  <DialogDescription>{editingProperty ? "Update property details" : "Add a new property to your inventory"}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="property_name">Property Name *</Label>
                    <Input id="property_name" value={formData.property_name} onChange={(e) => setFormData({ ...formData, property_name: e.target.value })} placeholder="e.g., Sunset Villa" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Mumbai, Maharashtra" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="5000000" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="area">Area (sq ft) *</Label>
                      <Input id="area" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="1200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="property_type">Property Type *</Label>
                      <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
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
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional property details..." rows={4} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingProperty ? "Update" : "Create"}</Button>
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
            onDelete={handleDelete}
            searchPlaceholder="Search by name or location..."
            searchKeys={["property_name", "location"]}
            statusKey="status"
            statusFilters={realEstateStatusFilters}
            emptyMessage="No properties found. Add your first property!"
            deletingId={deleting}
          />
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default RealEstate;