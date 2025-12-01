import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { propertyQueryConfig } from "./useQueryConfig";

export const usePropertyData = <T extends Record<string, any>>(
  tableName: string,
  queryKey: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as T[];
    },
    ...propertyQueryConfig,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] as const });
      toast({ title: "Item deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] as const });
      toast({ title: "Items deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting items",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkStatusUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await (supabase as any)
        .from(tableName)
        .update({ status })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] as const });
      toast({ title: "Status updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const { error } = await (supabase as any)
        .from(tableName)
        .insert([payload]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] as const });
      toast({ title: "Item created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<T> }) => {
      const { error } = await (supabase as any)
        .from(tableName)
        .update(payload)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] as const });
      toast({ title: "Item updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    data: data || [],
    isLoading,
    error,
    deleteItem: deleteMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    bulkStatusUpdate: bulkStatusUpdateMutation.mutate,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkUpdating: bulkStatusUpdateMutation.isPending,
  };
};
