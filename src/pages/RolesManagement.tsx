import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoles } from "@/hooks/useRoles";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Pencil, Trash2, Shield, Lock, Settings } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/DashboardLayout";

const RolesManagement = () => {
  const {
    roles,
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
  const [selectedRole, setSelectedRole] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleCreateRole = () => {
    if (!formData.name.trim()) return;
    createRole({ name: formData.name, description: formData.description || undefined });
    setFormData({ name: "", description: "" });
    setIsCreateOpen(false);
  };

  const handleEditRole = () => {
    if (!selectedRole || !formData.name.trim()) return;
    updateRole({ id: selectedRole.id, name: formData.name, description: formData.description || undefined });
    setFormData({ name: "", description: "" });
    setSelectedRole(null);
    setIsEditOpen(false);
  };

  const handleOpenEdit = (role: { id: string; name: string; description: string | null }) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description || "" });
    setIsEditOpen(true);
  };

  const handleOpenPermissions = (role: { id: string; name: string }) => {
    setSelectedRole({ ...role, description: null });
    const currentPermissions = roleSidebarItems
      .filter(rsi => rsi.role_id === role.id)
      .map(rsi => rsi.sidebar_item_id);
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
    setSelectedPermissions(prev =>
      prev.includes(sidebarItemId)
        ? prev.filter(id => id !== sidebarItemId)
        : [...prev, sidebarItemId]
    );
  };

  const getRolePermissionCount = (roleId: string) => {
    return roleSidebarItems.filter(rsi => rsi.role_id === roleId).length;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Roles Management
            </CardTitle>
            <CardDescription>
              Create and manage user roles with custom permissions
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {role.is_system_role && <Lock className="h-4 w-4 text-muted-foreground" />}
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getRolePermissionCount(role.id)} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.is_system_role ? "default" : "outline"}>
                          {role.is_system_role ? "System" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenPermissions(role)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEdit(role)}
                            disabled={role.is_system_role}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeleteRoleId(role.id)}
                            disabled={role.is_system_role}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> System roles (superAdmin, user) cannot be deleted or renamed. 
              You can still modify their permissions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role with custom permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Manager"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
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
            <DialogDescription>
              Update the role details
            </DialogDescription>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
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
            <DialogDescription>
              Select which menu items this role can access
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
            {sidebarItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
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
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this role and remove it from all users. This action cannot be undone.
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