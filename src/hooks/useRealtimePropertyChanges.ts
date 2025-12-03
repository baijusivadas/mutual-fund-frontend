import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RentalProperty, Flat, RealEstateProperty } from "@/types";

type PropertyTable = 'rental_properties' | 'flats' | 'real_estate';

interface UseRealtimePropertyChangesOptions {
  tables: PropertyTable[];
  enabled?: boolean;
}

export const useRealtimePropertyChanges = ({ tables, enabled = true }: UseRealtimePropertyChangesOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    const handleChange = (
      payload: any,
      tableName: string,
      getPropertyName: (data: any) => string
    ) => {
      if (payload.eventType === 'UPDATE') {
        const newData = payload.new;
        const oldData = payload.old;

        if (newData.status !== oldData.status) {
          toast.success(`Status Updated`, {
            description: `${getPropertyName(newData)} status changed to ${newData.status}`,
          });
        }

        if (tableName === 'rental_properties' && newData.tenant_name && newData.tenant_name !== oldData.tenant_name) {
          toast.info(`New Tenant Assigned`, {
            description: `${newData.tenant_name} assigned to ${getPropertyName(newData)}`,
          });
        }
      }

      if (payload.eventType === 'INSERT') {
        toast.success(`New Property Added`, {
          description: `${getPropertyName(payload.new)} has been added`,
        });
      }
    };

    const tableConfig: Record<PropertyTable, { nameKey: string }> = {
      rental_properties: { nameKey: 'property_name' },
      flats: { nameKey: 'flat_name' },
      real_estate: { nameKey: 'property_name' },
    };

    tables.forEach((table) => {
      const config = tableConfig[table];
      const channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => handleChange(payload, table, (data) => data[config.nameKey])
        )
        .subscribe();
      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [tables, enabled]);
};