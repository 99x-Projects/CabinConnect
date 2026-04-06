import type { UUID, UserRole, Locale } from '@cabinconnect/shared';

export interface UserProps {
  id: UUID;
  email: string;
  displayName: string;
  role: UserRole;
  locale: Locale;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id() { return this.props.id; }
  get email() { return this.props.email; }
  get role() { return this.props.role; }

  isAdmin(): boolean {
    return this.props.role === 'admin';
  }

  isSuppliier(): boolean {
    return this.props.role === 'supplier';
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
