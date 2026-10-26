import { useState, useMemo, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, User as UserIcon } from "lucide-react";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { useAuth } from "@/contexts/AuthContext";
import { userQueryConfig } from "@/hooks/useQueryConfig";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { userRoleFilters } from "@/data/filterOptions";
import { authApi } from "@/services/api";
import { getErrorMessage } from "@/lib/errors";
import { CommonCard } from "@/components/shared/CommonCard";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonSelect } from "@/components/shared/CommonSelect";
import { PageHeader } from "@/components/shared/PageHeader";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: "superAdmin" | "user";
  created_at: string;
}

const SEARCH_KEYS: (keyof UserWithRole)[] = ["email", "full_name"];

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "superAdmin", label: "SuperAdmin" },
];

const UserManagement = () => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await authApi.getUsers();
      return response.data?.data ?? response.data;
    },
    enabled: !!token,
    ...userQueryConfig,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "superAdmin" | "user" }) => {
      const response = await authApi.updateUserRole(userId, newRole);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error updating role",
        description: getErrorMessage(error, "Failed to update user role"),
        variant: "destructive",
      });
    },
    onSettled: () => setUpdating(null),
  });

  const handleRoleChange = useCallback(
    (userId: string, newRole: "superAdmin" | "user") => {
      const target = users.find((u: UserWithRole) => u.id === userId);
      if (target?.role === "superAdmin") {
        toast({
          title: "Action Disabled",
          description: "SuperAdmin role cannot be modified.",
          variant: "destructive",
        });
        return;
      }
      setUpdating(userId);
      updateRoleMutation.mutate({ userId, newRole });
    },
    [users, toast, updateRoleMutation]
  );

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await authApi.deleteUser(userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error deleting user",
        description: getErrorMessage(error, "Failed to delete user"),
        variant: "destructive",
      });
    },
    onSettled: () => setDeleting(null),
  });

  const handleDeleteUser = useCallback(
    (userId: string) => {
      const target = users.find((u: UserWithRole) => u.id === userId);
      if (target?.role === "superAdmin") {
        toast({
          title: "Action Disabled",
          description: "SuperAdmin accounts cannot be deleted.",
          variant: "destructive",
        });
        return;
      }
      setDeleting(userId);
      deleteUserMutation.mutate({ userId });
    },
    [users, toast, deleteUserMutation]
  );

  const columns: ColumnConfig<UserWithRole>[] = useMemo(
    () => [
      {
        key: "full_name",
        label: "User",
        sortable: true,
        render: (user) => (
          <div className="flex items-center gap-2">
            {user.role === "superAdmin" ? (
              <Shield className="h-4 w-4 text-primary" />
            ) : (
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-semibold text-foreground">{user.full_name || "N/A"}</span>
            {user.role === "superAdmin" && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40 text-primary font-bold">
                Protected
              </Badge>
            )}
          </div>
        ),
      },
      { key: "email", label: "Email", sortable: true, className: "font-mono text-xs" },
      {
        key: "role",
        label: "Role",
        sortable: true,
        render: (user) => (
          <Badge
            variant={user.role === "superAdmin" ? "default" : "secondary"}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
          >
            {user.role}
          </Badge>
        ),
      },
      {
        key: "role_selector",
        label: "Change Role",
        render: (user) => (
          <CommonSelect
            value={user.role}
            onValueChange={(value) => handleRoleChange(user.id, value as "superAdmin" | "user")}
            disabled={updating === user.id || deleting === user.id || user.role === "superAdmin"}
            options={ROLE_OPTIONS}
            className="w-[140px]"
          />
        ),
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (user) =>
          new Date(user.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
    ],
    [handleRoleChange, updating, deleting]
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="User Management"
        description="Manage user credentials, administration access, and role assignments"
        actions={<AddUserDialog />}
      />
      <div className="space-y-6">
        <CommonCard noHeader className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl">
          <CommonTable<UserWithRole>
            data={users}
            columns={columns}
            searchPlaceholder="Search by email or name..."
            searchKeys={SEARCH_KEYS}
            statusKey="role"
            statusFilters={userRoleFilters}
            emptyMessage="No users found"
            onEdit={(user) =>
              setEditingUser({ id: user.id, email: user.email, full_name: user.full_name })
            }
            onDelete={handleDeleteUser}
            canDelete={(user) => user.role !== "superAdmin"}
            deletingId={deleting}
          />
        </CommonCard>

        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      </div>
    </div>
  );
};

export default memo(UserManagement);
