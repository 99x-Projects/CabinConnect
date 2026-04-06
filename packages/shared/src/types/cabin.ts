import type { UUID, GeoPoint } from './index.js';

export interface Cabin {
  id: UUID;
  ownerId: UUID;
  name: string;
  address: string;
  location?: GeoPoint;
  sizeM2?: number;
  yearBuilt?: number;
  bedrooms?: number;
  resort?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'roofing'
  | 'heating'
  | 'cleaning'
  | 'renovation'
  | 'inspection'
  | 'other';

export interface MaintenanceRecord {
  id: UUID;
  cabinId: UUID;
  title: string;
  description?: string;
  date: string;
  cost?: number;
  category: MaintenanceCategory;
  completedBy?: string;
  nextDueDate?: string;
  createdAt: string;
}

export type CostType =
  | 'mortgage'
  | 'insurance'
  | 'property_tax'
  | 'utilities'
  | 'maintenance_budget'
  | 'association_fee'
  | 'other';

export type CostFrequency = 'monthly' | 'quarterly' | 'annually' | 'one_time';

export interface OwnershipCost {
  id: UUID;
  cabinId: UUID;
  label: string;
  type: CostType;
  amount: number;
  currency: string;
  frequency: CostFrequency;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  role: string;
}

export interface VisitorInstructions {
  id: UUID;
  cabinId: UUID;
  accessCode?: string;
  wifiName?: string;
  wifiPassword?: string;
  parkingInfo?: string;
  houseRules?: string;
  emergencyContacts: EmergencyContact[];
  checkInInfo?: string;
  checkOutInfo?: string;
  updatedAt: string;
}

// Derived — computed from OwnershipCost records
export interface CostSummary {
  monthlyTotal: number;
  annualTotal: number;
  currency: string;
  breakdown: Array<{ label: string; monthly: number }>;
}
