export interface AvailabilityWindow {
  id: string;
  cabinId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  notes?: string;
  createdAt: string;
}

export interface CabinBooking {
  id: string;
  cabinId: string;
  userId: string;
  userName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CabinInvite {
  id: string;
  cabinId: string;
  invitedEmail: string;
  invitedUserId?: string;
  invitedUserName?: string;
  invitedBy: string;
  createdAt: string;
}
