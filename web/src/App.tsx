import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { LoginPage } from './pages/login-page';
import { CabinListPage } from './pages/cabin-list-page';
import { RegisterCabinPage } from './pages/register-cabin-page';
import { EditCabinPage } from './pages/edit-cabin-page';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cabins" element={<CabinListPage />} />
          <Route path="/cabins/new" element={<RegisterCabinPage />} />
          <Route path="/cabins/:id/edit" element={<EditCabinPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/cabins" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
