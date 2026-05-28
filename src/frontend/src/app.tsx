import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/auth-provider';
import { RequireAuth } from './auth/require-auth';
import { useFeatureFlag } from './lib/feature-flags';
import { CabinOperationalPage } from './pages/cabin-operational-page';
import { EditCabinPage } from './pages/edit-cabin-page';
import { HealthPage } from './pages/health-page';
import { OwnerHomePage } from './pages/owner-home-page';
import { RegisterCabinPage } from './pages/register-cabin-page';
import { SignInPage } from './pages/sign-in-page';
import { SignUpPage } from './pages/sign-up-page';

export function App(): JSX.Element {
  const cabinProfileMvpEnabled = useFeatureFlag('cabin_profile_mvp');

  return (
    <AuthProvider>
      <Routes>
        <Route path="/health" element={<HealthPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route
          path="/my-cabin"
          element={(
            <RequireAuth>
              <OwnerHomePage />
            </RequireAuth>
          )}
        />
        {cabinProfileMvpEnabled && (
          <>
            <Route
              path="/my-cabin/register"
              element={(
                <RequireAuth>
                  <RegisterCabinPage />
                </RequireAuth>
              )}
            />
            <Route
              path="/my-cabin/edit"
              element={(
                <RequireAuth>
                  <EditCabinPage />
                </RequireAuth>
              )}
            />
            <Route
              path="/my-cabin/operational"
              element={(
                <RequireAuth>
                  <CabinOperationalPage />
                </RequireAuth>
              )}
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/my-cabin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
