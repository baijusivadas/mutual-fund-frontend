import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Lock,
  Settings,
  Search,
} from "lucide-react";
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
import { useRoles } from "@/hooks/useRoles";

type Role = {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
};

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

  const [dialog, setDialog] = useState<
    "create" | "edit" | "permissions" | null
  >(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  /** ------------------ Memoized Data ------------------ */

  const permissionCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    roleSidebarItems.forEach((rsi) => {
      map[rsi.role_id] = (map[rsi.role_id] || 0) + 1;
    });
    return map;
  }, [roleSidebarItems]);

  const filteredSidebarItems = useMemo(() => {
    return sidebarItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [sidebarItems, search]);

  /** ------------------ Handlers ------------------ */

  const openCreate = () => {
    setFormData({ name: "", description: "" });
    setDialog("create");
  };

  const openEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description || "" });
    setDialog("edit");
  };

  const openPermissions = (role: Role) => {
    setSelectedRole(role);
    const current = roleSidebarItems
      .filter((r) => r.role_id === role.id)
      .map((r) => r.sidebar_item_id);
    setSelectedPermissions(current);
    setDialog("permissions");
  };

  const handleCreate = useCallback(() => {
    if (!formData.name.trim()) return;
    createRole({
      name: formData.name,
      description: formData.description || undefined,
    });
    setDialog(null);
  }, [formData, createRole]);

  const handleUpdate = useCallback(() => {
    if (!selectedRole || !formData.name.trim()) return;
    updateRole({
      id: selectedRole.id,
      name: formData.name,
      description: formData.description || undefined,
    });
    setDialog(null);
  }, [formData, selectedRole, updateRole]);

  const handleSavePermissions = useCallback(() => {
    if (!selectedRole) return;
    updateRoleSidebarItems({
      roleId: selectedRole.id,
      sidebarItemIds: selectedPermissions,
    });
    setDialog(null);
  }, [selectedPermissions, selectedRole, updateRoleSidebarItems]);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () =>
    setSelectedPermissions(filteredSidebarItems.map((i) => i.id));

  const clearAll = () => setSelectedPermissions([]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8" /> Roles Management
              </CardTitle>
              <CardDescription>
                Create and manage user roles with permissions
              </CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Create Role
            </Button>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="flex items-center gap-2 font-medium">
                        {role.is_system_role && <Lock className="h-4 w-4" />}
                        {role.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {permissionCountMap[role.id] || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.is_system_role ? "default" : "outline"}
                        >
                          {role.is_system_role ? "System" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openPermissions(role)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={role.is_system_role}
                            onClick={() => openEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            disabled={role.is_system_role}
                            onClick={() => setDeleteRoleId(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ------------------ CREATE / EDIT DIALOG ------------------ */}
        <Dialog
          open={dialog === "create" || dialog === "edit"}
          onOpenChange={() => setDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialog === "create" ? "Create Role" : "Edit Role"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={dialog === "create" ? handleCreate : handleUpdate}
                disabled={isCreating || isUpdating}
              >
                {dialog === "create"
                  ? isCreating
                    ? "Creating..."
                    : "Create"
                  : isUpdating
                  ? "Saving..."
                  : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ------------------ PERMISSIONS DIALOG (STYLE FIXED) ------------------ */}
        <Dialog
          open={dialog === "permissions"}
          onOpenChange={() => setDialog(null)}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                Manage Permissions – {selectedRole?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Select which menu items this role can access
              </p>
            </div>

            {/* Search + Bulk Actions (NON-STICKY) */}
            <div className="p-4 border-b flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>

            {/* Scrollable Permission Grid */}
            <div className="max-h-[420px] overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSidebarItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer
                   hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={selectedPermissions.includes(item.id)}
                      onCheckedChange={() => togglePermission(item.id)}
                    />

                    <div className="leading-tight">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.href}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer (NOT floating anymore) */}
            <div className="flex items-center justify-between p-4 border-t bg-background">
              <p className="text-sm text-muted-foreground">
                Selected: {selectedPermissions.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialog(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePermissions}>
                  Save Permissions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ------------------ DELETE ------------------ */}
        <AlertDialog
          open={!!deleteRoleId}
          onOpenChange={() => setDeleteRoleId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteRoleId) deleteRole(deleteRoleId);
                  setDeleteRoleId(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default RolesManagement;
