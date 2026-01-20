import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleWithChildren extends Role {
  children: RoleWithChildren[];
  depth: number;
}

export interface SidebarItemBasic {
  id: string;
  name: string;
  href: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

// Build tree structure from flat roles
export const buildRoleTree = (roles: Role[]): RoleWithChildren[] => {
  const roleMap = new Map<string, RoleWithChildren>();
  const rootRoles: RoleWithChildren[] = [];

  // First pass: create all nodes
  roles.forEach(role => {
    roleMap.set(role.id, { ...role, children: [], depth: 0 });
  });

  // Second pass: build tree and calculate depths
  const calculateDepth = (roleId: string, currentDepth: number): void => {
    const role = roleMap.get(roleId);
    if (role) {
      role.depth = currentDepth;
      role.children.forEach(child => calculateDepth(child.id, currentDepth + 1));
    }
  };

  roles.forEach(role => {
    const node = roleMap.get(role.id)!;
    if (role.parent_id && roleMap.has(role.parent_id)) {
      roleMap.get(role.parent_id)!.children.push(node);
    } else {
      rootRoles.push(node);
    }
  });

  // Calculate depths for all nodes
  rootRoles.forEach(role => calculateDepth(role.id, 0));

  return rootRoles;
};

// Flatten tree for display while preserving hierarchy info
export const flattenRoleTree = (tree: RoleWithChildren[]): RoleWithChildren[] => {
  const result: RoleWithChildren[] = [];
  const traverse = (nodes: RoleWithChildren[]) => {
    nodes.forEach(node => {
      result.push(node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return result;
};

export const useRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const roleHierarchy = useQuery({
    queryKey: ['role-hierarchy'],
    queryFn: async (): Promise<RoleWithChildren[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return buildRoleTree(data || []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const sidebarItemsQuery = useQuery({
    queryKey: ['all-sidebar-items'],
    queryFn: async (): Promise<SidebarItemBasic[]> => {
      const { data, error } = await supabase
        .from('sidebar_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const roleSidebarItemsQuery = useQuery({
    queryKey: ['role-sidebar-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_sidebar_items')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createRoleMutation = useMutation({
    mutationFn: async ({ name, description, parent_id }: { name: string; description?: string; parent_id?: string | null }) => {
      const { data, error } = await supabase
        .from('roles')
        .insert({ name, description, parent_id: parent_id || null })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-hierarchy'] });
      toast({ title: "Role created", description: "New role has been created successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error creating role", description: error.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, name, description, parent_id }: { id: string; name: string; description?: string; parent_id?: string | null }) => {
      const { data, error } = await supabase
        .from('roles')
        .update({ name, description, parent_id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-hierarchy'] });
      toast({ title: "Role updated", description: "Role has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error updating role", description: error.message, variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-hierarchy'] });
      toast({ title: "Role deleted", description: "Role has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting role", description: error.message, variant: "destructive" });
    },
  });

  const updateRoleSidebarItems = useMutation({
    mutationFn: async ({ roleId, sidebarItemIds }: { roleId: string; sidebarItemIds: string[] }) => {
      // First delete existing items for this role
      const { error: deleteError } = await supabase
        .from('role_sidebar_items')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) throw deleteError;

      // Then insert new items
      if (sidebarItemIds.length > 0) {
        const insertData = sidebarItemIds.map(sid => ({
          role_id: roleId,
          sidebar_item_id: sid,
        }));

        const { error: insertError } = await supabase
          .from('role_sidebar_items')
          .insert(insertData);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-sidebar-items'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-items'] });
      toast({ title: "Permissions updated", description: "Role permissions have been updated." });
    },
    onError: (error: any) => {
      toast({ title: "Error updating permissions", description: error.message, variant: "destructive" });
    },
  });

  return {
    roles: rolesQuery.data || [],
    roleHierarchy: roleHierarchy.data || [],
    sidebarItems: sidebarItemsQuery.data || [],
    roleSidebarItems: roleSidebarItemsQuery.data || [],
    isLoading: rolesQuery.isLoading || sidebarItemsQuery.isLoading || roleSidebarItemsQuery.isLoading,
    createRole: createRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deleteRole: deleteRoleMutation.mutate,
    updateRoleSidebarItems: updateRoleSidebarItems.mutate,
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
};
