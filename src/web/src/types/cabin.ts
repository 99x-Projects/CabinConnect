/** Shared response types matching the .NET API DTO shapes agreed in elaboration. */

export interface Community {
  id: string
  name: string
  region: string
}

export interface Amenity {
  id: string
  name: string
}

export interface CabinAddress {
  street: string
  postalCode: string
  city: string
  country: string
}

export interface Cabin {
  id: string
  name: string
  address: CabinAddress
  community: Community
  capacity: number
  amenities: Amenity[]
  createdAt: string
  updatedAt: string
}

export interface CreateCabinRequest {
  name: string
  address: CabinAddress
  communityId: string
  capacity: number
  amenityIds: string[]
}

export interface UpdateCabinRequest {
  name?: string
  address?: Partial<CabinAddress>
  communityId?: string
  capacity?: number
  amenityIds?: string[]
}

export interface ValidationProblem {
  title: string
  errors: Record<string, string[]>
}
