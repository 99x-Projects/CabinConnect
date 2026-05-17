export interface AmenityTag {
  id: string;
  name: string;
}

export interface KeyInfo {
  cabinId: string;
  accessCodes: string | null;
  emergencyContacts: string | null;
  houseRules: string | null;
}

export interface Cabin {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string | null;
  hostId: string;
  baseRate: number;
  isActive: boolean;
  version: number;
  amenityTags: AmenityTag[];
  createdAt: string;
  updatedAt: string;
}

export interface CabinDetail extends Cabin {
  keyInfo: KeyInfo;
}

export interface CreateCabinPayload {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  amenityTagIds: string[];
}

export interface UpdateCabinPayload {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  amenityTagIds: string[];
  version: number;
}
