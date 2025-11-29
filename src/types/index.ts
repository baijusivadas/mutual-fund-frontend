// Shared types across the application

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "superAdmin" | "user";
  created_at: string;
}

export interface Flat {
  id: string;
  flat_name: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalProperty {
  id: string;
  property_name: string;
  location: string;
  monthly_rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  tenant_name: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RealEstateProperty {
  id: string;
  property_name: string;
  location: string;
  price: number;
  area: number;
  property_type: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoldItem {
  id: string;
  item_name: string;
  weight: number;
  purity: string;
  price: number;
  purchase_date: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  searchQuery: string;
  statusFilter: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  propertyType?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}