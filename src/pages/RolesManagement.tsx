import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles, RoleWithChildren, flattenRoleTree } from "@/hooks/useRoles";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Pencil, Trash2, Shield, Lock, Settings, ChevronRight, ChevronDown, FolderTree, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";

// Tree node component for hierarchical display
const RoleTreeNode = ({
  role,
  expandedRoles,
  toggleExpand,
  onEdit,
  onDelete,
  onPermissions,
  getRolePermissionCount,
}: {
  role: RoleWithChildren;
  expandedRoles: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (role: RoleWithChildren) => void;
  onDelete: (id: string) => void;
  onPermissions: (role: RoleWithChildren) => void;
  getRolePermissionCount: (roleId: string) => number;
}) => {
  const hasChildren = role.children.length > 0;
  const isExpanded = expandedRoles.has(role.id);

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-3 rounded-lg transition-all border border-transparent",
          "hover:bg-muted/50 hover:border-border"
        )}
        style={{ paddingLeft: `${role.depth * 24 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(role.id)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        <Shield className={cn("h-5 w-5", role.is_system_role ? "text-primary" : "text-muted-foreground")} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{role.name}</span>
            {role.is_system_role && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                System
              </Badge>
            )}
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {role.children.length} child{role.children.length > 1 ? 'ren' : ''}
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="text-xs text-muted-foreground truncate">{role.description}</p>
          )}
        </div>

        <Badge variant="secondary" className="text-xs">
          {getRolePermissionCount(role.id)} permissions
        </Badge>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPermissions(role)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(role)}
            disabled={role.is_system_role}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(role.id)}
            disabled={role.is_system_role}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l-2 border-border/50 ml-6">
          {role.children.map((child) => (
            <RoleTreeNode
              key={child.id}
              role={child}
              expandedRoles={expandedRoles}
              toggleExpand={toggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onPermissions={onPermissions}
              getRolePermissionCount={getRolePermissionCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

        {/* Create Role Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Add a new role with optional parent hierarchy</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Manager, Father, Daughter"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role's purpose..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent Role (optional)</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (root level)</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Child roles inherit access restrictions from their parent
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} disabled={isCreating || !formData.name.trim()}>
                {isCreating ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update the role details and hierarchy</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-parent">Parent Role</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (root level)</SelectItem>
                    {getAvailableParentRoles(selectedRole?.id).map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole} disabled={isUpdating || !formData.name.trim()}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Permissions - {selectedRole?.name}</DialogTitle>
              <DialogDescription>Select which menu items this role can access</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
              {sidebarItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer border",
                    selectedPermissions.includes(item.id)
                      ? "bg-primary/5 border-primary/30"
                      : "hover:bg-muted border-transparent"
                  )}
                  onClick={() => togglePermission(item.id)}
                >
                  <Checkbox
                    id={item.id}
                    checked={selectedPermissions.includes(item.id)}
                    onCheckedChange={() => togglePermission(item.id)}
                  />
                  <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.href}</div>
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePermissions}>Save Permissions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this role. Child roles will become root-level roles. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteRoleId) {
                    deleteRole(deleteRoleId);
                    setDeleteRoleId(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default RolesManagement;
