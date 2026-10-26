// Centralized React Query configuration for caching
export const queryConfig = {
  // Cache data for 5 minutes before considering it stale
  staleTime: 5 * 60 * 1000,
  // Keep unused data in cache for 10 minutes
  gcTime: 10 * 60 * 1000,
  // Retry failed requests 2 times
  retry: 2,
  // Refetch on window focus for fresh data
  refetchOnWindowFocus: true,
};

// Specific configurations for different data types
export const userQueryConfig = {
  ...queryConfig,
  staleTime: 3 * 60 * 1000, // 3 minutes for user data
};

export const propertyQueryConfig = {
  ...queryConfig,
  staleTime: 5 * 60 * 1000, // 5 minutes for property data
};

export const transactionQueryConfig = {
  ...queryConfig,
  staleTime: 2 * 60 * 1000, // 2 minutes for transaction data
  gcTime: 15 * 60 * 1000, // Keep longer in cache
};
