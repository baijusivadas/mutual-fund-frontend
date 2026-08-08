import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
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
      const response = await api.get(`/advanced/${tableName}`);
      const responseData = response.data?.data || response.data || [];
      return responseData as T[];
    },
    ...propertyQueryConfig,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/advanced/${tableName}/${id}`);
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
      await Promise.all(ids.map(id => api.delete(`/advanced/${tableName}/${id}`)));
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
      await Promise.all(ids.map(id => api.put(`/advanced/${tableName}/${id}`, { status })));
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
      await api.post(`/advanced/${tableName}`, payload);
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
      await api.put(`/advanced/${tableName}/${id}`, payload);
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
