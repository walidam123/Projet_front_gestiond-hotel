import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import ReservationsPage from './pages/ReservationsPage';
import ServicesPage from './pages/ServicesPage';
import InvoicesPage from './pages/InvoicesPage';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<DashboardPage />} />

        <Route path="/reservations" element={
          <PrivateRoute allowedRoles={['ROLE_RECEPTIONNISTE', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
            <ReservationsPage />
          </PrivateRoute>
        } />

        <Route path="/rooms" element={
          <PrivateRoute allowedRoles={['ROLE_GOUVERNANTE', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
            <RoomsPage />
          </PrivateRoute>
        } />

        <Route path="/services" element={
          <PrivateRoute allowedRoles={['ROLE_MANAGER', 'ROLE_ADMIN']}>
            <ServicesPage />
          </PrivateRoute>
        } />

        <Route path="/invoices" element={
          <PrivateRoute allowedRoles={['ROLE_RECEPTIONNISTE', 'ROLE_ADMIN']}>
            <InvoicesPage />
          </PrivateRoute>
        } />

        <Route path="/clients" element={
          <PrivateRoute allowedRoles={['ROLE_RECEPTIONNISTE', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
            <ClientsPage />
          </PrivateRoute>
        } />

        <Route path="/users" element={
          <PrivateRoute allowedRoles={['ROLE_ADMIN']}>
            <UsersPage />
          </PrivateRoute>
        } />

        <Route path="/unauthorized" element={<div className="p-8 text-red-500 text-xl text-center font-bold">Accès refusé - Rôle insuffisant</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
