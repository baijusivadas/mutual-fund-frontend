import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { propertyQueryConfig } from "../hooks/useQueryConfig";
import { PaginationControls } from "../components/PaginationControls";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<RealEstate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
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

  const fetchProperties = async (): Promise<RealEstate[]> => {
    const { data, error } = await supabase
      .from('real_estate')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const { data: properties = [], isLoading: loading } = useQuery({
    queryKey: ['real_estate'],
    queryFn: fetchProperties,
    ...propertyQueryConfig,
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        property_name: formData.property_name,
        location: formData.location,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        property_type: formData.property_type,
        status: formData.status,
        description: formData.description || null,
      };

      if (editingProperty) {
        const { error } = await supabase
          .from('real_estate')
          .update(payload)
          .eq('id', editingProperty.id);
        if (error) throw error;
        toast({ title: "Property updated successfully" });
      } else {
        const { error } = await supabase
          .from('real_estate')
          .insert([payload]);
        if (error) throw error;
        toast({ title: "Property created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error saving property",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const { error } = await supabase
        .from('real_estate')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Property deleted successfully" });
      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error deleting property",
        description: error.message,
        variant: "destructive",
      });
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

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, searchQuery, statusFilter]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProperties.length / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Real Estate Management
              </CardTitle>
              <CardDescription>
                Manage your real estate properties inventory
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
                  <DialogDescription>
                    {editingProperty ? "Update property details" : "Add a new property to your inventory"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                      <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all" ? "No properties match your filters" : "No properties found. Add your first property!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.property_name}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell className="capitalize">{property.property_type}</TableCell>
                      <TableCell>₹{property.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{property.area.toLocaleString()} sq ft</TableCell>
                      <TableCell>
                        <Badge variant={
                          property.status === 'available' ? 'default' :
                          property.status === 'sold' ? 'secondary' : 'outline'
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
                              <Button
                                variant="destructive"
                                size="icon"
                                disabled={deleting === property.id}
                              >
                                {deleting === property.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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
                                  onClick={() => handleDelete(property.id)}
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

          {filteredProperties.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredProperties.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealEstate;