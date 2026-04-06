import type { UUID } from './index.js';

export interface OrderItem {
  name: string;
  quantity: number;
  unit: string;   // kg, pcs, l, etc.
  notes?: string;
}

export type OrderStatus =
  | 'draft'           // building the list
  | 'submitted'       // sent to supermarket, looking for volunteer
  | 'volunteer_found' // someone accepted
  | 'out_for_delivery'// volunteer is on the way
  | 'delivered'       // done
  | 'no_volunteer'    // deadline passed — owner must self-pickup
  | 'cancelled';

export interface GroceryOrder {
  id: UUID;
  userId: UUID;
  userName: string;
  cabinId?: UUID;
  items: OrderItem[];
  supermarket: string;
  deliveryAddress: string;  // drop-off point near cabin
  pickupDeadline: string;   // ISO — when volunteer must pick up by
  notes?: string;
  status: OrderStatus;
  volunteerId?: UUID;
  volunteerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerDelivery {
  id: UUID;
  orderId: UUID;
  volunteerId: UUID;
  volunteerName: string;
  acceptedAt: string;
  estimatedDelivery?: string;
  completedAt?: string;
}
