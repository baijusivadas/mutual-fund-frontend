/**
 * useRealtimePropertyChanges
 * 
 * Previously used Supabase realtime subscriptions to listen for
 * property table changes. Now a no-op stub since we migrated to
 * the Express backend. Use React Query cache invalidation instead.
 */

type PropertyTable = 'rental_properties' | 'flats' | 'real_estate';

interface UseRealtimePropertyChangesOptions {
  tables: PropertyTable[];
  enabled?: boolean;
}

export const useRealtimePropertyChanges = (_options: UseRealtimePropertyChangesOptions) => {
  // No-op: realtime subscriptions removed with Supabase migration.
  // Property changes are now handled via React Query invalidation after mutations.
};
