import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Link2, Trash2, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ASSET_TYPES = [
  { value: "mutual_funds", label: "Mutual Funds" },
  { value: "stocks", label: "Stocks" },
  { value: "gold", label: "Gold" },
  { value: "real_estate", label: "Real Estate" },
  { value: "flats", label: "Flats" },
  { value: "rental_properties", label: "Rental Properties" },
  { value: "cars", label: "Cars" },
  { value: "liabilities", label: "Liabilities" },
];

const UserInvestmentMapping = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("");
  const [investorName, setInvestorName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with profiles
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["all-users-for-mapping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing mappings
  const { data: mappings = [], isLoading: loadingMappings } = useQuery({
    queryKey: ["investment-mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_investment_mapping")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch unique investor names from purchases
  const { data: investorNames = [] } = useQuery({
    queryKey: ["unique-investor-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("investor_name")
        .order("investor_name");
      if (error) throw error;
      const uniqueNames = [...new Set(data.map((d) => d.investor_name))];
      return uniqueNames;
    },
  });

  // Create mapping mutation
  const createMappingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("user_investment_mapping").insert({
        user_id: selectedUser,
        asset_type: selectedAssetType,
        investor_name: investorName || null,
        created_by: user?.id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment-mappings"] });
      toast({
        title: "Mapping Created",
        description: "Investment mapping has been created successfully.",
      });
      setIsDialogOpen(false);
      setSelectedUser("");
      setSelectedAssetType("");
      setInvestorName("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mapping mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      const { error } = await supabase
        .from("user_investment_mapping")
        .delete()
        .eq("id", mappingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment-mappings"] });
      toast({
        title: "Mapping Deleted",
        description: "Investment mapping has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.full_name || user?.email || "Unknown User";
  };

  const getAssetTypeLabel = (value: string) => {
    return ASSET_TYPES.find((t) => t.value === value)?.label || value;
  };

  if (loadingUsers || loadingMappings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Investment Mapping</h1>
            <p className="text-muted-foreground">
              Assign investments and assets to specific users
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Investment Mapping</DialogTitle>
                <DialogDescription>
                  Assign an asset type to a user. For mutual funds, you can also specify the investor name.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {ASSET_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAssetType === "mutual_funds" && (
                  <div className="space-y-2">
                    <Label htmlFor="investor-name">Investor Name (Optional)</Label>
                    <Select value={investorName} onValueChange={setInvestorName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investor name" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {investorNames.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Or enter a custom name:
                    </p>
                    <Input
                      value={investorName}
                      onChange={(e) => setInvestorName(e.target.value)}
                      placeholder="Enter investor name"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createMappingMutation.mutate()}
                  disabled={!selectedUser || !selectedAssetType || createMappingMutation.isPending}
                >
                  {createMappingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Mapping"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Link2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Mappings</p>
                  <p className="text-2xl font-bold">{mappings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mapped Users</p>
                  <p className="text-2xl font-bold">
                    {new Set(mappings.map((m) => m.user_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mappings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Mappings</CardTitle>
            <CardDescription>
              View and manage user-investment assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No mappings created yet. Click "Add Mapping" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Asset Type</TableHead>
                      <TableHead>Investor Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium">
                          {getUserName(mapping.user_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getAssetTypeLabel(mapping.asset_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mapping.investor_name || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(mapping.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMappingMutation.mutate(mapping.id)}
                            disabled={deleteMappingMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserInvestmentMapping;