// Common shared types across CabinConnect modules

export type UUID = string;
export type Locale = 'no' | 'en';
export type LocalizedText = Record<Locale, string>;

// User roles
export type UserRole = 'user' | 'supplier' | 'admin';

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Geo
export interface GeoPoint {
  lat: number;
  lng: number;
}

// API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Supplier Directory types
export type SupplierStatus = 'pending' | 'approved' | 'rejected';

export type SupplierCategory =
  | 'plumber'
  | 'electrician'
  | 'carpenter'
  | 'cleaner'
  | 'painter'
  | 'roofer'
  | 'landscaper'
  | 'handyman'
  | 'other';

export interface Supplier {
  id: UUID;
  name: string;
  categories: SupplierCategory[];
  serviceAreas: string[];
  location: GeoPoint;
  phone: string;
  email?: string;
  website?: string;
  description: LocalizedText;
  photos: string[];
  nominatedBy: UUID;
  claimedBy?: UUID;
  status: SupplierStatus;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: UUID;
  supplierId: UUID;
  userId: UUID;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  jobDate?: string;
  createdAt: string;
  reply?: SupplierReply;
}

export interface SupplierReply {
  id: UUID;
  reviewId: UUID;
  supplierId: UUID;
  comment: string;
  createdAt: string;
}

// Supplier search params
export interface SupplierSearchParams extends PaginationParams {
  category?: SupplierCategory;
  resort?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}
