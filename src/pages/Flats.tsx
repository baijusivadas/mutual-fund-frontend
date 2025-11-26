import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Home } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { usePropertyData } from "../hooks/usePropertyData";
import { AdvancedSearchFilters } from "../components/AdvancedSearchFilters";
import { BulkActionBar } from "../components/BulkActionBar";
import { PaginationControls } from "@/components/PaginationControls";
import type { Flat } from "@/types";
import { DashboardLayout } from "@/components/DashboardLayout";

const Flats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const {
    data: flats,
    isLoading,
    deleteItem,
    bulkDelete,
    bulkStatusUpdate,
    createItem,
    updateItem,
  } = usePropertyData<Flat>("flats", "flats");

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

  const filteredFlats = useMemo(() => {
    return flats.filter((flat) => {
      const matchesSearch =
        flat.flat_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flat.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || flat.status === statusFilter;
      const matchesMinPrice = minPrice === undefined || flat.price >= minPrice;
      const matchesMaxPrice = maxPrice === undefined || flat.price <= maxPrice;
      return (
        matchesSearch && matchesStatus && matchesMinPrice && matchesMaxPrice
      );
    });
  }, [flats, searchQuery, statusFilter, minPrice, maxPrice]);

  const paginatedFlats = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFlats.slice(startIndex, startIndex + pageSize);
  }, [filteredFlats, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredFlats.length / pageSize);

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

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedFlats.map((f) => f.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
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
    { value: "sold", label: "Sold" },
    { value: "reserved", label: "Reserved" },
  ];

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
                    Add Flat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFlat ? "Edit Flat" : "Add New Flat"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingFlat
                        ? "Update flat details"
                        : "Add a new flat to your inventory"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="flat_name">Flat Name *</Label>
                      <Input
                        id="flat_name"
                        value={formData.flat_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flat_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Sunny Apartment 3B"
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
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          placeholder="8500000"
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bedrooms: e.target.value,
                            })
                          }
                          placeholder="2"
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
                        <Label htmlFor="floor">Floor</Label>
                        <Input
                          id="floor"
                          type="number"
                          value={formData.floor}
                          onChange={(e) =>
                            setFormData({ ...formData, floor: e.target.value })
                          }
                          placeholder="5"
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Additional flat details..."
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
                      {editingFlat ? "Update" : "Create"}
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
              statusOptions={statusOptions.filter((opt) => opt.value !== "all")}
              onClearSelection={() => setSelectedIds([])}
            />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedIds.length === paginatedFlats.length &&
                          paginatedFlats.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
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
                  {paginatedFlats.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-muted-foreground"
                      >
                        {searchQuery || statusFilter !== "all"
                          ? "No flats match your filters"
                          : "No flats found. Add your first flat!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFlats.map((flat) => (
                      <TableRow key={flat.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(flat.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(flat.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {flat.flat_name}
                        </TableCell>
                        <TableCell>{flat.location}</TableCell>
                        <TableCell>
                          {flat.bedrooms}BHK, {flat.bathrooms} Bath
                        </TableCell>
                        <TableCell>
                          {flat.area.toLocaleString()} sq ft
                        </TableCell>
                        <TableCell>
                          {flat.floor ? `${flat.floor}th` : "N/A"}
                        </TableCell>
                        <TableCell>
                          ₹{flat.price.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              flat.status === "available"
                                ? "default"
                                : flat.status === "sold"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize"
                          >
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
                                <Button variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete{" "}
                                    <strong>{flat.flat_name}</strong>. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteItem(flat.id)}
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
              totalItems={filteredFlats.length}
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

export default Flats;
