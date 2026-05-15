export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow';

export interface Booking {
  id: string;
  cabinId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}
