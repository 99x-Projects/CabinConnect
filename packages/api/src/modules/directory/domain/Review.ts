import type { UUID } from '@cabinconnect/shared';

export interface ReviewProps {
  id: UUID;
  supplierId: UUID;
  userId: UUID;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  jobDate?: Date;
  createdAt: Date;
}

export class Review {
  constructor(private readonly props: ReviewProps) {}

  get id() { return this.props.id; }
  get supplierId() { return this.props.supplierId; }
  get userId() { return this.props.userId; }
  get rating() { return this.props.rating; }

  toJSON(): ReviewProps {
    return { ...this.props };
  }
}
