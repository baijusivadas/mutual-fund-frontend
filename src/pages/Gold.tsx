import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Coins } from "lucide-react";
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
import { propertyQueryConfig } from "@/hooks/useQueryConfig";
import {
  CommonTable,
  ColumnConfig,
  StatusBadge,
} from "@/components/CommonTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { goldStatusFilters, purityOptions } from "../data/filterOptions";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Gold | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
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

  const { data: goldItems = [], isLoading } = useQuery({
    queryKey: ["gold"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gold")
        .select("*")
        .order("purchase_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
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
      } else {
        const { error } = await supabase.from("gold").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gold"] });
      toast({ title: editingItem ? "Gold item updated" : "Gold item created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      item_name: formData.item_name,
      weight: parseFloat(formData.weight),
      purity: formData.purity,
      price: parseFloat(formData.price),
      purchase_date: formData.purchase_date,
      status: formData.status,
      description: formData.description || null,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const { error } = await supabase.from("gold").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["gold"] });
      toast({ title: "Gold item deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
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

  const columns: ColumnConfig<Gold>[] = [
    {
      key: "item_name",
      label: "Item Name",
      sortable: true,
      className: "font-medium",
    },
    {
      key: "weight",
      label: "Weight",
      sortable: true,
      render: (item) => `${item.weight}g`,
    },
    { key: "purity", label: "Purity", sortable: true },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (item) => `₹${item.price.toLocaleString("en-IN")}`,
    },
    {
      key: "purchase_date",
      label: "Purchase Date",
      sortable: true,
      render: (item) => new Date(item.purchase_date).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
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
                            {purityOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
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
                          {goldStatusFilters
                            .filter((f) => f.value !== "all")
                            .map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
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
            <CommonTable
              data={goldItems}
              columns={columns}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              searchPlaceholder="Search by item name..."
              searchKeys={["item_name"]}
              statusKey="status"
              statusFilters={goldStatusFilters}
              emptyMessage="No gold items found. Add your first item!"
              deletingId={deleting}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Gold;
