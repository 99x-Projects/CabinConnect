import { describe, expect, it } from 'vitest';
import { validateSignUp } from './sign-up-validation';

describe('validateSignUp', () => {
  it('returns no errors for valid input', () => {
    const errors = validateSignUp({
      email: 'alice@example.com',
      password: 'correcthorsebatterystaple',
      displayName: 'Alice O.',
    });
    expect(errors).toEqual({});
  });

  it('flags empty email, password, and display name', () => {
    const errors = validateSignUp({ email: '   ', password: '', displayName: '   ' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.displayName).toBeDefined();
  });

  it('flags malformed emails', () => {
    expect(validateSignUp({
      email: 'no-at-sign',
      password: 'longenoughpw',
      displayName: 'A',
    }).email).toBeDefined();
  });

  it('flags passwords shorter than 8 characters', () => {
    const errors = validateSignUp({
      email: 'a@b.co',
      password: 'short',
      displayName: 'A',
    });
    expect(errors.password).toBeDefined();
  });

  it('flags display names longer than 100 characters', () => {
    const errors = validateSignUp({
      email: 'a@b.co',
      password: 'longenoughpw',
      displayName: 'x'.repeat(101),
    });
    expect(errors.displayName).toBeDefined();
  });
});
