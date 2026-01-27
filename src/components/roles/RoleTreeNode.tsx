import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoleWithChildren } from "@/hooks/useRoles";
import { ChevronDown, ChevronRight, Lock, Pencil, Settings, Shield, Trash2, Users } from "lucide-react";

interface RoleTreeNodeProps {
  role: RoleWithChildren;
  expandedRoles: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (role: RoleWithChildren) => void;
  onDelete: (id: string) => void; // string to match state in parent, though original was id
  onPermissions: (role: RoleWithChildren) => void;
  getRolePermissionCount: (roleId: string) => number;
}

export const RoleTreeNode = ({
  role,
  expandedRoles,
  toggleExpand,
  onEdit,
  onDelete,
  onPermissions,
  getRolePermissionCount,
}: RoleTreeNodeProps) => {
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
