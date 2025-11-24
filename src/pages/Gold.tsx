import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Pencil, Trash2, Coins } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { propertyQueryConfig } from "../hooks/useQueryConfig";
import { PaginationControls } from "../components/PaginationControls";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Gold {
  id: string;
  item_name: string;
  weight: number;
  purity: string;
  price: number;
  purchase_date: string;
  status: string;
  description: string | null;
  created_at: string;
}

const Gold = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Gold | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    item_name: "",
    weight: "",
    purity: "24K",
    price: "",
    purchase_date: "",
    status: "in_stock",
    description: "",
  });

  const fetchGoldItems = async (): Promise<Gold[]> => {
    const { data, error } = await supabase
      .from("gold")
      .select("*")
      .order("purchase_date", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const { data: goldItems = [], isLoading: loading } = useQuery({
    queryKey: ["gold"],
    queryFn: fetchGoldItems,
    ...propertyQueryConfig,
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingItem) {
        const { error } = await supabase
          .from("gold")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
        return "updated";
      } else {
        const { error } = await supabase.from("gold").insert([payload]);
        if (error) throw error;
        return "created";
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["gold"] });
      toast({
        title:
          result === "updated"
            ? "Gold item updated successfully"
            : "Gold item created successfully",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error saving gold item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const payload = {
      item_name: formData.item_name,
      weight: parseFloat(formData.weight),
      purity: formData.purity,
      price: parseFloat(formData.price),
      purchase_date: formData.purchase_date,
      status: formData.status,
      description: formData.description || null,
    };
    mutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gold").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gold"] });
      toast({ title: "Gold item deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting gold item",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setDeleting(null),
  });

  const handleDelete = (id: string) => {
    setDeleting(id);
    deleteMutation.mutate(id);
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      weight: "",
      purity: "24K",
      price: "",
      purchase_date: "",
      status: "in_stock",
      description: "",
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: Gold) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      weight: item.weight.toString(),
      purity: item.purity,
      price: item.price.toString(),
      purchase_date: item.purchase_date,
      status: item.status,
      description: item.description || "",
    });
    setDialogOpen(true);
  };

  const filteredGoldItems = useMemo(() => {
    return goldItems.filter((item) => {
      const matchesSearch = item.item_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [goldItems, searchQuery, statusFilter]);

  const paginatedGoldItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredGoldItems.slice(startIndex, endIndex);
  }, [filteredGoldItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredGoldItems.length / pageSize);

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
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <Coins className="h-8 w-8" />
                  Gold Inventory Management
                </CardTitle>
                <CardDescription>
                  Manage your gold inventory and track purchases
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
                    Add Gold Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Gold Item" : "Add New Gold Item"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingItem
                        ? "Update gold item details"
                        : "Add a new gold item to your inventory"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="item_name">Item Name *</Label>
                      <Input
                        id="item_name"
                        value={formData.item_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            item_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Gold Bar, Gold Coin"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="weight">Weight (grams) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          placeholder="10.5"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="purity">Purity *</Label>
                        <Select
                          value={formData.purity}
                          onValueChange={(value) =>
                            setFormData({ ...formData, purity: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24K">24K</SelectItem>
                            <SelectItem value="22K">22K</SelectItem>
                            <SelectItem value="18K">18K</SelectItem>
                            <SelectItem value="14K">14K</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                          placeholder="50000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="purchase_date">Purchase Date *</Label>
                        <Input
                          id="purchase_date"
                          type="date"
                          value={formData.purchase_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              purchase_date: e.target.value,
                            })
                          }
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
                          <SelectItem value="in_stock">In Stock</SelectItem>
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
                        placeholder="Additional item details..."
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
                      {editingItem ? "Update" : "Create"}
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
                  placeholder="Search by item name..."
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
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGoldItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        {searchQuery || statusFilter !== "all"
                          ? "No items match your filters"
                          : "No gold items found. Add your first item!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedGoldItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell>{item.weight}g</TableCell>
                        <TableCell>{item.purity}</TableCell>
                        <TableCell>
                          ₹{item.price.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          {new Date(item.purchase_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "in_stock"
                                ? "default"
                                : item.status === "sold"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {item.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  disabled={deleting === item.id}
                                >
                                  {deleting === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete{" "}
                                    <strong>{item.item_name}</strong>. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
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

            {filteredGoldItems.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredGoldItems.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Gold;
