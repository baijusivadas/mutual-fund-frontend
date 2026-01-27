import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { RoleWithChildren, Role, SidebarItemBasic } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";

interface CreateRoleDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: { name: string; description: string; parent_id: string };
    setFormData: (data: { name: string; description: string; parent_id: string }) => void;
    handleCreateRole: () => void;
    isCreating: boolean;
    roles: Role[];
}

export const CreateRoleDialog = ({
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    handleCreateRole,
    isCreating,
    roles,
}: CreateRoleDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={isCreating || !formData.name.trim()}>
                    {isCreating ? "Creating..." : "Create Role"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

interface EditRoleDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: { name: string; description: string; parent_id: string };
    setFormData: (data: { name: string; description: string; parent_id: string }) => void;
    handleEditRole: () => void;
    isUpdating: boolean;
    getAvailableParentRoles: (excludeRoleId?: string) => Role[];
    selectedRole: RoleWithChildren | null;
}

export const EditRoleDialog = ({
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    handleEditRole,
    isUpdating,
    getAvailableParentRoles,
    selectedRole,
}: EditRoleDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button onClick={handleEditRole} disabled={isUpdating || !formData.name.trim()}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

interface PermissionsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRole: RoleWithChildren | null;
    sidebarItems: SidebarItemBasic[];
    selectedPermissions: string[];
    togglePermission: (id: string) => void;
    handleSavePermissions: () => void;
}

export const PermissionsDialog = ({
    isOpen,
    onOpenChange,
    selectedRole,
    sidebarItems,
    selectedPermissions,
    togglePermission,
    handleSavePermissions,
}: PermissionsDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button onClick={handleSavePermissions}>Save Permissions</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

interface DeleteRoleAlertProps {
    deleteRoleId: string | null;
    setDeleteRoleId: (id: string | null) => void;
    onDeleteConfirm: () => void;
}

export const DeleteRoleAlertDialog = ({
    deleteRoleId,
    setDeleteRoleId,
    onDeleteConfirm,
}: DeleteRoleAlertProps) => (
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
                    onClick={onDeleteConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Delete Role
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
