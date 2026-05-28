import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isFeatureEnabled } from './feature-flags';

describe('isFeatureEnabled', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.stubEnv('VITE_FF_CABIN_PROFILE_MVP', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.assign(import.meta.env, originalEnv);
  });

  it('returns false when env var is unset', () => {
    vi.stubEnv('VITE_FF_CABIN_PROFILE_MVP', '');
    expect(isFeatureEnabled('cabin_profile_mvp')).toBe(false);
  });

  it.each(['1', 'TRUE', 'True', 'yes', 'on'])(
    'returns false for non-canonical truthy string %s',
    (value) => {
      vi.stubEnv('VITE_FF_CABIN_PROFILE_MVP', value);
      expect(isFeatureEnabled('cabin_profile_mvp')).toBe(false);
    },
  );

  it('returns true only for exact lowercase "true"', () => {
    vi.stubEnv('VITE_FF_CABIN_PROFILE_MVP', 'true');
    expect(isFeatureEnabled('cabin_profile_mvp')).toBe(true);
  });
});
