import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/auth';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CabinDetailPage } from '@/pages/CabinDetailPage';
import { InvitePage } from '@/pages/InvitePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <AuthenticatedLayout>
                <DashboardPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/cabins/:id"
            element={
              <AuthenticatedLayout>
                <CabinDetailPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/invite"
            element={
              <AuthenticatedLayout>
                <InvitePage />
              </AuthenticatedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
