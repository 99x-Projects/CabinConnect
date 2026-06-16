export interface AmenityResponse {
  id: string;
  displayName: string;
}

export interface CabinResponse {
  id: string;
  name: string;
  description: string;
  streetAddress: string;
  capacity: number;
  isActive: boolean;
  catalogAmenities: AmenityResponse[];
  customAmenities: string[];
}

export interface RegisterCabinRequest {
  name: string;
  description: string;
  streetAddress: string;
  capacity: number;
  catalogAmenityIds: string[] | null;
  customAmenities: string[] | null;
}

export interface UpdateCabinRequest {
  name: string;
  description: string;
  streetAddress: string;
  capacity: number;
  catalogAmenityIds: string[] | null;
  customAmenities: string[] | null;
}
