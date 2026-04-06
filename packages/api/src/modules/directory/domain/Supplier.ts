import type { UUID, SupplierCategory, SupplierStatus, LocalizedText, GeoPoint } from '@cabinconnect/shared';

export interface SupplierProps {
  id: UUID;
  name: string;
  categories: SupplierCategory[];
  serviceAreas: string[];
  location: GeoPoint;
  phone: string;
  email?: string;
  website?: string;
  description: LocalizedText;
  photos: string[];
  nominatedBy: UUID;
  claimedBy?: UUID;
  status: SupplierStatus;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Supplier {
  constructor(private readonly props: SupplierProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get status() { return this.props.status; }
  get claimedBy() { return this.props.claimedBy; }

  isApproved(): boolean {
    return this.props.status === 'approved';
  }

  isClaimed(): boolean {
    return this.props.claimedBy !== undefined;
  }

  canBeClaimed(): boolean {
    return this.isApproved() && !this.isClaimed();
  }

  toJSON(): SupplierProps {
    return { ...this.props };
  }
}
