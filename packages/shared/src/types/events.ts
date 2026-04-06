import type { UUID, GeoPoint, PaginationParams, PaginatedResult } from './index.js';

export type EventStatus = 'draft' | 'published' | 'cancelled';

export type EventCategory =
  | 'social'
  | 'sports'
  | 'kids'
  | 'culture'
  | 'community'
  | 'market'
  | 'other';

export interface CabinEvent {
  id: UUID;
  title: string;
  description: string;
  location: string;
  geoPoint?: GeoPoint;
  startDate: string;
  endDate: string;
  organizerId: UUID;
  organizerName: string;
  resort?: string;
  category: EventCategory;
  imageUrl?: string;
  status: EventStatus;
  maxAttendees?: number;
  attendeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export type RSVPStatus = 'going' | 'maybe' | 'not_going';

export interface EventRSVP {
  id: UUID;
  eventId: UUID;
  userId: UUID;
  status: RSVPStatus;
  createdAt: string;
}

export interface EventSearchParams extends PaginationParams {
  resort?: string;
  category?: EventCategory;
  from?: string;
  to?: string;
  status?: EventStatus;
}

export type CreateEventInput = Omit<CabinEvent, 'id' | 'organizerId' | 'organizerName' | 'attendeeCount' | 'createdAt' | 'updatedAt'>;
