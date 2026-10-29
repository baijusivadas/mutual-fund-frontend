import { useState, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoles, RoleWithChildren } from "@/hooks/useRoles";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Plus, Shield, Info } from "lucide-react";
import { RoleTreeNode } from "@/components/roles/RoleTreeNode";
import {
  CreateRoleDialog,
  EditRoleDialog,
  PermissionsDialog,
  DeleteRoleAlertDialog,
} from "@/components/roles/RoleDialogs";
import { PageHeader } from "@/components/shared/PageHeader";

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

  const toggleExpand = useCallback((id: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreateRole = useCallback(() => {
    if (!formData.name.trim()) return;
    createRole({
      name: formData.name,
      description: formData.description || undefined,
      parent_id: formData.parent_id || null,
    });
    setFormData({ name: "", description: "", parent_id: "" });
    setIsCreateOpen(false);
  }, [formData, createRole]);

  const handleEditRole = useCallback(() => {
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
  }, [selectedRole, formData, updateRole]);

  const handleOpenEdit = useCallback((role: RoleWithChildren) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      parent_id: role.parent_id || "",
    });
    setIsEditOpen(true);
  }, []);

  const handleOpenPermissions = useCallback(
    (role: RoleWithChildren) => {
      setSelectedRole(role);
      const currentPermissions = roleSidebarItems
        .filter((rsi) => rsi.role_id === role.id)
        .map((rsi) => rsi.sidebar_item_id);
      setSelectedPermissions(currentPermissions);
      setIsPermissionsOpen(true);
    },
    [roleSidebarItems]
  );

  const handleSavePermissions = useCallback(() => {
    if (!selectedRole) return;
    updateRoleSidebarItems({ roleId: selectedRole.id, sidebarItemIds: selectedPermissions });
    setIsPermissionsOpen(false);
    setSelectedRole(null);
  }, [selectedRole, updateRoleSidebarItems, selectedPermissions]);

  const togglePermission = useCallback((sidebarItemId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(sidebarItemId)
        ? prev.filter((id) => id !== sidebarItemId)
        : [...prev, sidebarItemId]
    );
  }, []);

  const getRolePermissionCount = useCallback(
    (roleId: string) => {
      return roleSidebarItems.filter((rsi) => rsi.role_id === roleId).length;
    },
    [roleSidebarItems]
  );

  // Get available parent roles
  const getAvailableParentRoles = useCallback(
    (excludeRoleId?: string) => {
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
    },
    [roles]
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Role Hierarchy Management"
        description="Configure hierarchical roles, organizational tree structures, and feature permissions"
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        }
      />

      <div className="space-y-6">
        <Card className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="pt-6">
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
              {roleHierarchy.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <Shield className="h-12 w-12 mx-auto opacity-30 text-primary" />
                  <p className="font-medium">No roles found. Create your first role to get started.</p>
                </div>
              ) : (
                <div className="p-3 space-y-1">
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

            <div className="mt-6 p-4 rounded-xl border border-border/40 bg-muted/40 flex items-start gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Hierarchy Policy:</strong> Child roles inherit access scope within their family branch or organization. A parent role can view and audit sub-accounts and portfolios assigned to descendant roles.
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
    </div>
  );
};

export default memo(RolesManagement);
