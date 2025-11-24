import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Pencil, Trash2, Home } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/DashboardLayout";

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
  created_at: string;
}

const Flats = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlats(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching flats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
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
        const { error } = await supabase
          .from('flats')
          .update(payload)
          .eq('id', editingFlat.id);
        if (error) throw error;
        toast({ title: "Flat updated successfully" });
      } else {
        const { error } = await supabase
          .from('flats')
          .insert([payload]);
        if (error) throw error;
        toast({ title: "Flat created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchFlats();
    } catch (error: any) {
      toast({
        title: "Error saving flat",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const { error } = await supabase
        .from('flats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Flat deleted successfully" });
      fetchFlats();
    } catch (error: any) {
      toast({
        title: "Error deleting flat",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
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

  const filteredFlats = useMemo(() => {
    return flats.filter(flat => {
      const matchesSearch = flat.flat_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           flat.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || flat.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [flats, searchQuery, statusFilter]);

  if (loading) {
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
                <Home className="h-8 w-8" />
                Flats Management
              </CardTitle>
              <CardDescription>
                Manage your residential flats inventory
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Flat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFlat ? "Edit Flat" : "Add New Flat"}</DialogTitle>
                  <DialogDescription>
                    {editingFlat ? "Update flat details" : "Add a new flat to your inventory"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="flat_name">Flat Name *</Label>
                    <Input
                      id="flat_name"
                      value={formData.flat_name}
                      onChange={(e) => setFormData({ ...formData, flat_name: e.target.value })}
                      placeholder="e.g., Sunny Apartment 3B"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Andheri West, Mumbai"
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
                        placeholder="8500000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="area">Area (sq ft) *</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="950"
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
                        placeholder="2"
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
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        placeholder="5"
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
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional flat details..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>
                    {editingFlat ? "Update" : "Create"}
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
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Config</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all" ? "No flats match your filters" : "No flats found. Add your first flat!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlats.map((flat) => (
                    <TableRow key={flat.id}>
                      <TableCell className="font-medium">{flat.flat_name}</TableCell>
                      <TableCell>{flat.location}</TableCell>
                      <TableCell>{flat.bedrooms}BHK, {flat.bathrooms} Bath</TableCell>
                      <TableCell>{flat.area.toLocaleString()} sq ft</TableCell>
                      <TableCell>{flat.floor ? `${flat.floor}th` : 'N/A'}</TableCell>
                      <TableCell>₹{flat.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          flat.status === 'available' ? 'default' :
                          flat.status === 'sold' ? 'secondary' : 'outline'
                        } className="capitalize">
                          {flat.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(flat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                disabled={deleting === flat.id}
                              >
                                {deleting === flat.id ? (
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
                                  This will permanently delete <strong>{flat.flat_name}</strong>. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(flat.id)}
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
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default Flats;