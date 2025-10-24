import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { session, profile, loading } = useAuth();

  // Si aún está verificando la sesión, no mostramos nada para evitar parpadeos
  if (loading) {
    return null; // O un componente de Spinner/Cargando...
  }

  // 1. Si no hay sesión, lo mandamos al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta requiere roles específicos y el usuario no tiene el correcto
  if (allowedRoles && !allowedRoles.includes(profile?.rol)) {
    // Lo mandamos a una página segura a la que sí tenga acceso, como el home.
    return <Navigate to="/home" replace />;
  }

  // 3. Si todo está en orden, muestra la página solicitada
  return <Outlet />;
};
