import { useMemo } from 'react';

export type FeatureFlagName = 'cabin_profile_mvp';

const FLAG_ENV_KEYS: Readonly<Record<FeatureFlagName, keyof ImportMetaEnv>> = {
  cabin_profile_mvp: 'VITE_FF_CABIN_PROFILE_MVP',
};

/**
 * Strict, case-sensitive `"true"` parse. Any other value (including `"True"`,
 * `"1"`, `"yes"`, or `undefined`) is treated as OFF. This asymmetry with the
 * backend's forgiving boolean binding is deliberate — see docs/feature-flags.md.
 */
export function isFeatureEnabled(name: FeatureFlagName): boolean {
  const envKey = FLAG_ENV_KEYS[name];
  const raw = import.meta.env[envKey];
  return raw === 'true';
}

export function useFeatureFlag(name: FeatureFlagName): boolean {
  return useMemo(() => isFeatureEnabled(name), [name]);
}
