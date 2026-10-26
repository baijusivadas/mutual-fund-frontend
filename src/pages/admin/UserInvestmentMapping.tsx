import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Link2, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { CommonCard } from "@/components/shared/CommonCard";
import { CommonSelect } from "@/components/shared/CommonSelect";
import { MetricCard } from "@/components/shared/MetricCard";
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

interface UserOption {
  id: string;
  email: string;
  full_name?: string | null;
}

interface PurchaseInvestor {
  investor_name?: string | null;
}

const SEARCH_KEYS: (keyof Mapping)[] = ["investor_name"];

const UserInvestmentMapping = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("");
  const [investorName, setInvestorName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users with profiles
  const { data: users = [], isLoading: loadingUsers } = useQuery<UserOption[]>({
    queryKey: ["all-users-for-mapping"],
    queryFn: async () => {
      const response = await api.get("/auth/users");
      return response.data?.data || response.data || [];
    },
    enabled: !!token,
  });

  // Fetch existing mappings
  const { data: mappings = [], isLoading: loadingMappings } = useQuery<Mapping[]>({
    queryKey: ["investment-mappings"],
    queryFn: async () => {
      const response = await api.get("/user-mappings");
      return response.data?.data || response.data || [];
    },
    enabled: !!token,
  });

  // Fetch unique investor names from purchases
  const { data: investorNames = [] } = useQuery<string[]>({
    queryKey: ["unique-investor-names"],
    queryFn: async () => {
      const response = await api.get("/advanced/purchases");
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      const uniqueNames = [...new Set(data.map((d: PurchaseInvestor) => d.investor_name))].filter(
        Boolean
      ) as string[];
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
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to create mapping"),
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
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to delete mapping"),
        variant: "destructive",
      });
    },
  });

  const getUserName = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      return user?.full_name || user?.email || "Unknown User";
    },
    [users]
  );

  const getAssetTypeLabel = useCallback((value: string) => {
    return ASSET_TYPES.find((t) => t.value === value)?.label || value;
  }, []);

  const columns: ColumnConfig<Mapping>[] = useMemo(
    () => [
      {
        key: "user_id",
        label: "User",
        sortable: true,
        className: "font-semibold text-foreground",
        render: (item) => getUserName(item.user_id),
      },
      {
        key: "asset_type",
        label: "Asset Type",
        sortable: true,
        render: (item) => (
          <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 rounded-full capitalize">
            {getAssetTypeLabel(item.asset_type)}
          </Badge>
        ),
      },
      {
        key: "investor_name",
        label: "Mapped Investor",
        sortable: true,
        render: (item) => item.investor_name || <span className="text-muted-foreground">-</span>,
      },
      {
        key: "created_at",
        label: "Created At",
        sortable: true,
        render: (item) =>
          new Date(item.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
    ],
    [getUserName, getAssetTypeLabel]
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label: user.full_name || user.email,
      })),
    [users]
  );

  const investorOptions = useMemo(
    () =>
      investorNames.map((name: string) => ({
        value: name,
        label: name,
      })),
    [investorNames]
  );

  const uniqueMappedUsersCount = useMemo(
    () => new Set(mappings.map((m) => m.user_id)).size,
    [mappings]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMappingMutation.mutate(id);
    },
    [deleteMappingMutation]
  );

  const handleCreate = useCallback(() => {
    createMappingMutation.mutate();
  }, [createMappingMutation]);

  if (loadingUsers || loadingMappings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="User Investment Mapping"
        description="Assign investments, portfolios, and asset types to specific user logins"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold">
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Investment Mapping</DialogTitle>
                <DialogDescription className="text-xs">
                  Assign an asset type to a user. For mutual funds, you can optionally restrict to a specific investor name.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Target User *</Label>
                  <CommonSelect
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                    options={userOptions}
                    placeholder="Select a user"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type *</Label>
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
                      options={investorOptions}
                      placeholder="Map all or pick one investor"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!selectedUser || !selectedAssetType || createMappingMutation.isPending}
                  className="font-bold"
                >
                  {createMappingMutation.isPending ? "Creating..." : "Create Mapping"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title="Active Mappings"
          value={mappings.length}
          change="Asset Assignments"
          changeType="neutral"
          icon={Link2}
        />
        <MetricCard
          title="Mapped Users"
          value={uniqueMappedUsersCount}
          change="Distinct Portfolios Assigned"
          changeType="positive"
          icon={Users}
        />
      </div>

      <CommonCard
        title="Investment Mappings Directory"
        description="View and manage current user-to-asset allocation permissions"
        className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl"
      >
        <CommonTable<Mapping>
          data={mappings}
          columns={columns}
          searchPlaceholder="Search mappings by investor..."
          searchKeys={SEARCH_KEYS}
          onDelete={handleDelete}
          emptyMessage="No mappings created yet. Click 'Add Mapping' to assign portfolio views to users."
        />
      </CommonCard>
    </div>
  );
};

export default memo(UserInvestmentMapping);
