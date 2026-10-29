/**
 * Reusable filter option arrays for dropdowns and status badges across the app.
 * All options with value "all" are the catch-all filter; the rest are entity-specific values.
 */

export const userRoleFilters = [
  { value: "all", label: "All Roles" },
  { value: "user", label: "User" },
  { value: "superAdmin", label: "SuperAdmin" },
];

export const flatStatusFilters = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "reserved", label: "Reserved" },
];

export const goldStatusFilters = [
  { value: "all", label: "All Status" },
  { value: "in_stock", label: "In Stock" },
  { value: "sold", label: "Sold" },
  { value: "reserved", label: "Reserved" },
];

export const rentalStatusFilters = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
];

export const realEstateStatusFilters = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "pending", label: "Pending" },
];

/**
 * Property type options.
 * "residential" is first (the default form value); "all" is the catch-all for filters.
 */
export const propertyTypeOptions = [
  { value: "residential", label: "Residential" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "agricultural", label: "Agricultural" },
];

/** Filter variant that includes an "All Types" option for search/filter UIs. */
export const propertyTypeFilters = [
  { value: "all", label: "All Types" },
  ...propertyTypeOptions,
];

export const purityOptions = [
  { value: "24K", label: "24K" },
  { value: "22K", label: "22K" },
  { value: "18K", label: "18K" },
  { value: "14K", label: "14K" },
];

export const notificationStatusFilters = [
  { value: "all", label: "All Status" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];
