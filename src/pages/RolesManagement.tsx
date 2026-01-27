import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoles, RoleWithChildren } from "@/hooks/useRoles";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, FolderTree, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RoleTreeNode } from "@/components/roles/RoleTreeNode";
import {
  CreateRoleDialog,
  EditRoleDialog,
  PermissionsDialog,
  DeleteRoleAlertDialog,
} from "@/components/roles/RoleDialogs";

const RolesManagement = () => {
  const {
    roles,
    roleHierarchy,
    sidebarItems,
    roleSidebarItems,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    updateRoleSidebarItems,
    isCreating,
    isUpdating,
  } = useRoles();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleWithChildren | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", parent_id: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateRole = () => {
    if (!formData.name.trim()) return;
    createRole({
      name: formData.name,
      description: formData.description || undefined,
      parent_id: formData.parent_id || null,
    });
    setFormData({ name: "", description: "", parent_id: "" });
    setIsCreateOpen(false);
  };

  const handleEditRole = () => {
    if (!selectedRole || !formData.name.trim()) return;
    updateRole({
      id: selectedRole.id,
      name: formData.name,
      description: formData.description || undefined,
      parent_id: formData.parent_id || null,
    });
    setFormData({ name: "", description: "", parent_id: "" });
    setSelectedRole(null);
    setIsEditOpen(false);
  };

  const handleOpenEdit = (role: RoleWithChildren) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      parent_id: role.parent_id || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenPermissions = (role: RoleWithChildren) => {
    setSelectedRole(role);
    const currentPermissions = roleSidebarItems
      .filter((rsi) => rsi.role_id === role.id)
      .map((rsi) => rsi.sidebar_item_id);
    setSelectedPermissions(currentPermissions);
    setIsPermissionsOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    updateRoleSidebarItems({ roleId: selectedRole.id, sidebarItemIds: selectedPermissions });
    setIsPermissionsOpen(false);
    setSelectedRole(null);
  };

  const togglePermission = (sidebarItemId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(sidebarItemId) ? prev.filter((id) => id !== sidebarItemId) : [...prev, sidebarItemId]
    );
  };

  const getRolePermissionCount = (roleId: string) => {
    return roleSidebarItems.filter((rsi) => rsi.role_id === roleId).length;
  };

  // Get available parent roles (exclude current role and its descendants to prevent circular references)
  const getAvailableParentRoles = (excludeRoleId?: string) => {
    if (!excludeRoleId) return roles;

    const descendants = new Set<string>();
    const findDescendants = (roleId: string) => {
      roles.forEach((r) => {
        if (r.parent_id === roleId) {
          descendants.add(r.id);
          findDescendants(r.id);
        }
      });
    };
    findDescendants(excludeRoleId);

    return roles.filter((r) => r.id !== excludeRoleId && !descendants.has(r.id));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <FolderTree className="h-8 w-8 text-primary" />
                Role Hierarchy Management
              </CardTitle>
              <CardDescription>
                Manage roles in a tree structure where parent roles control child role permissions
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card">
              {roleHierarchy.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No roles found. Create your first role to get started.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {roleHierarchy.map((role) => (
                    <RoleTreeNode
                      key={role.id}
                      role={role}
                      expandedRoles={expandedRoles}
                      toggleExpand={toggleExpand}
                      onEdit={handleOpenEdit}
                      onDelete={setDeleteRoleId}
                      onPermissions={handleOpenPermissions}
                      getRolePermissionCount={getRolePermissionCount}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Hierarchy Note:</strong> Child roles can be used to manage access for family members
                or team hierarchies. Parent roles (like "Father") can access data of their child roles
                (like "Daughter's Portfolio").
              </p>
            </div>
          </CardContent>
        </Card>

        <CreateRoleDialog
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          formData={formData}
          setFormData={setFormData}
          handleCreateRole={handleCreateRole}
          isCreating={isCreating}
          roles={roles}
        />

        <EditRoleDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          formData={formData}
          setFormData={setFormData}
          handleEditRole={handleEditRole}
          isUpdating={isUpdating}
          getAvailableParentRoles={getAvailableParentRoles}
          selectedRole={selectedRole}
        />

        <PermissionsDialog
          isOpen={isPermissionsOpen}
          onOpenChange={setIsPermissionsOpen}
          selectedRole={selectedRole}
          sidebarItems={sidebarItems}
          selectedPermissions={selectedPermissions}
          togglePermission={togglePermission}
          handleSavePermissions={handleSavePermissions}
        />

        <DeleteRoleAlertDialog
          deleteRoleId={deleteRoleId}
          setDeleteRoleId={setDeleteRoleId}
          onDeleteConfirm={() => {
            if (deleteRoleId) {
              deleteRole(deleteRoleId);
              setDeleteRoleId(null);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default RolesManagement;
