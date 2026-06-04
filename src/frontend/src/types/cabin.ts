export type Amenity = 'WiFi' | 'Sauna' | 'Fireplace' | 'HotTub' | 'Parking';

export const ALL_AMENITIES: Amenity[] = ['WiFi', 'Sauna', 'Fireplace', 'HotTub', 'Parking'];

export type CabinStatus = 'Active' | 'Inactive';

export interface CabinDto {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  capacity: number;
  amenities: Amenity[];
  status: CabinStatus;
}

export interface CreateCabinRequest {
  name: string;
  location: string;
  capacity: number;
  amenities: Amenity[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
