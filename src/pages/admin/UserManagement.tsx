import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, User as UserIcon } from "lucide-react";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { useAuth } from "@/contexts/AuthContext";
import { userQueryConfig } from "@/hooks/useQueryConfig";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { userRoleFilters } from "@/data/filterOptions";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { authApi } from "@/services/api";
import { CommonCard } from "@/components/shared/CommonCard";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { CommonSelect } from "@/components/shared/CommonSelect";

import { PageHeader } from "@/components/shared/PageHeader";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'superAdmin' | 'user';
  created_at: string;
}

const UserManagement = () => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await authApi.getUsers();
      return response.data?.data ?? response.data;
    },
    enabled: !!token,
    ...userQueryConfig,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'superAdmin' | 'user' }) => {
      const response = await authApi.updateUserRole(userId, newRole);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating role",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setUpdating(null),
  });

  const handleRoleChange = (userId: string, newRole: 'superAdmin' | 'user') => {
    setUpdating(userId);
    updateRoleMutation.mutate({ userId, newRole });
  };

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await authApi.deleteUser(userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting user",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setDeleting(null),
  });

  const handleDeleteUser = (userId: string) => {
    setDeleting(userId);
    deleteUserMutation.mutate({ userId });
  };

  const columns: ColumnConfig<UserWithRole>[] = [
    { 
      key: "full_name", 
      label: "User", 
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.role === 'superAdmin' ? (
            <Shield className="h-4 w-4 text-primary" />
          ) : (
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          )}
          {user.full_name || 'N/A'}
        </div>
      )
    },
    { key: "email", label: "Email", sortable: true },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (user) => (
        <Badge variant={user.role === 'superAdmin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      )
    },
    { 
      key: "role_selector", 
      label: "Change Role", 
      render: (user) => (
        <CommonSelect
          value={user.role}
          onValueChange={(value) => handleRoleChange(user.id, value as 'superAdmin' | 'user')}
          disabled={updating === user.id || deleting === user.id}
          options={[
            { value: "user", label: "User" },
            { value: "superAdmin", label: "SuperAdmin" }
          ]}
          className="w-[140px]"
        />
      )
    },
    { 
      key: "created_at", 
      label: "Created", 
      sortable: true,
      render: (user) => new Date(user.created_at).toLocaleDateString()
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="User Management" 
        description="Manage user accounts and assign roles."
        actions={<AddUserDialog />}
      />
      <div className="space-y-6">
        <CommonCard noHeader>
          <CommonTable<UserWithRole>
            data={users}
            columns={columns}
            searchPlaceholder="Search by email or name..."
            searchKeys={["email", "full_name"]}
            statusKey="role"
            statusFilters={userRoleFilters}
            emptyMessage="No users found"
            onEdit={(user) => setEditingUser({ id: user.id, email: user.email, full_name: user.full_name })}
            onDelete={handleDeleteUser}
            deletingId={deleting}
          />
        </CommonCard>

        <EditUserDialog 
          user={editingUser} 
          open={!!editingUser} 
          onOpenChange={(open) => !open && setEditingUser(null)} 
        />
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;

