import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { ProtectedRoute } from './components/protected-route';
import { AppLayout } from './components/app-layout';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';
import { DashboardPage } from './pages/dashboard-page';
import { CreateCabinPage } from './pages/create-cabin-page';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cabins/new" element={<CreateCabinPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

