import type { UUID, GeoPoint } from './index.js';

export type ToolCategory =
  | 'power_tools'
  | 'hand_tools'
  | 'garden'
  | 'snow_removal'
  | 'cleaning'
  | 'camping'
  | 'construction'
  | 'other';

export type ToolCondition = 'new' | 'good' | 'fair' | 'worn';

export interface Tool {
  id: UUID;
  ownerId: UUID;
  ownerName: string;
  name: string;
  description?: string;
  category: ToolCategory;
  condition: ToolCondition;
  photos: string[];
  location?: GeoPoint;
  resort?: string;
  available: boolean;
  pricePerDay?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface BorrowRequest {
  id: UUID;
  toolId: UUID;
  toolName: string;
  requesterId: UUID;
  requesterName: string;
  ownerId: UUID;
  startDate: string;
  endDate: string;
  message?: string;
  status: BorrowStatus;
  createdAt: string;
}

export interface ToolSearchParams {
  page: number;
  limit: number;
  category?: ToolCategory;
  resort?: string;
  availableOnly?: boolean;
}
