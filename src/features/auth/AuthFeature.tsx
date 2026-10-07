import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { RequireAuth, RequireAdmin } from './guards';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage';

/**
 * The Q5 feature owns a small nested router: a public login route, a protected
 * dashboard, and an admin-only stats page. Wrapped in AuthProvider so the whole
 * sub-tree shares one session.
 */
export default function AuthFeature() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
