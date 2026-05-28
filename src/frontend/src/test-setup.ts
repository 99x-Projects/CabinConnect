import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Provide non-empty placeholder values so the supabase-client module can
// initialise during tests without throwing. Individual tests stub these
// further via `vi.stubEnv` as needed.
vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5000');
