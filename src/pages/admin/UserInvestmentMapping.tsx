import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Link2, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { CommonCard } from "@/components/shared/CommonCard";
import { CommonSelect } from "@/components/shared/CommonSelect";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import api from "@/services/api";

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

interface Mapping {
  id: string;
  user_id: string;
  asset_type: string;
  investor_name: string | null;
  created_at: string;
}

const UserInvestmentMapping = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("");
  const [investorName, setInvestorName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users with profiles
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["all-users-for-mapping"],
    queryFn: async () => {
      const response = await api.get("/auth/users");
      return response.data;
    },
    enabled: !!token,
  });

  // Fetch existing mappings
  const { data: mappings = [], isLoading: loadingMappings } = useQuery({
    queryKey: ["investment-mappings"],
    queryFn: async () => {
      const response = await api.get("/user-mappings");
      return response.data;
    },
    enabled: !!token,
  });

  // Fetch unique investor names from purchases
  const { data: investorNames = [] } = useQuery({
    queryKey: ["unique-investor-names"],
    queryFn: async () => {
      const response = await api.get("/advanced/purchases");
      // advanced API might return { data: [], pagination: {} } or []
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const uniqueNames = [...new Set(data.map((d: any) => d.investor_name))].filter(Boolean) as string[];
      return uniqueNames;
    },
    enabled: !!token,
  });

  // Create mapping mutation
  const createMappingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/user-mappings", {
        user_id: selectedUser,
        asset_type: selectedAssetType,
        investor_name: investorName || null,
      });
      return response.data;
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
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mapping mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      await api.delete(`/user-mappings/${mappingId}`);
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
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.full_name || user?.email || "Unknown User";
  };

  const getAssetTypeLabel = (value: string) => {
    return ASSET_TYPES.find((t) => t.value === value)?.label || value;
  };

  const columns: ColumnConfig<Mapping>[] = [
    { 
      key: "user_id", 
      label: "User", 
      sortable: true,
      render: (item) => getUserName(item.user_id)
    },
    { 
      key: "asset_type", 
      label: "Asset Type", 
      sortable: true,
      render: (item) => (
        <Badge variant="secondary">
          {getAssetTypeLabel(item.asset_type)}
        </Badge>
      )
    },
    { 
      key: "investor_name", 
      label: "Investor Name", 
      sortable: true,
      render: (item) => item.investor_name || "-"
    },
    { 
      key: "created_at", 
      label: "Created At", 
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
  ];

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
      <PageHeader 
        title="User Investment Mapping" 
        description="Assign investments and assets to specific users"
        actions={
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
                  <CommonSelect
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                    options={users.map((user: any) => ({
                      value: user.id,
                      label: user.full_name || user.email
                    }))}
                    placeholder="Select a user"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <CommonSelect
                    value={selectedAssetType}
                    onValueChange={setSelectedAssetType}
                    options={ASSET_TYPES}
                    placeholder="Select asset type"
                  />
                </div>

                {selectedAssetType === "mutual_funds" && (
                  <div className="space-y-2">
                    <Label htmlFor="investor-name">Investor Name (Optional)</Label>
                    <CommonSelect
                      value={investorName}
                      onValueChange={setInvestorName}
                      options={investorNames.map((name: string) => ({
                        value: name,
                        label: name
                      }))}
                      placeholder="Select investor name"
                    />
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
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CommonCard noHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CommonCard>
          <CommonCard noHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <Link2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Mappings</p>
                <p className="text-2xl font-bold">{mappings.length}</p>
              </div>
            </div>
          </CommonCard>
          <CommonCard noHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mapped Users</p>
                <p className="text-2xl font-bold">
                  {new Set(mappings.map((m: any) => m.user_id)).size}
                </p>
              </div>
            </div>
          </CommonCard>
        </div>

        <CommonCard
          title="Investment Mappings"
          description="View and manage user-investment assignments"
        >
          <CommonTable<Mapping>
            data={mappings}
            columns={columns}
            searchPlaceholder="Search mappings..."
            searchKeys={["investor_name"]}
            onDelete={(id) => deleteMappingMutation.mutate(id)}
            emptyMessage="No mappings created yet. Click 'Add Mapping' to get started."
          />
        </CommonCard>
      </div>
    </DashboardLayout>
  );
};

export default UserInvestmentMapping;
