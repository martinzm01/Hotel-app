import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { session, profile, loading } = useAuth();

  // Si aún está cargando, mostramos un loader (o nada si preferís)
  if (loading || (session && !profile)) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <p className="text-gray-600 text-lg animate-pulse">Verificando acceso...</p>
      </div>
    );
  }

  // Si no hay sesión, redirigimos al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Si hay sesión pero el rol no coincide con los permitidos
  if (allowedRoles && !allowedRoles.includes(profile?.rol)) {
    // Si es admin, lo mandamos a /admin
    if (profile?.rol === "administrador") {
        return <Navigate to="/admin" replace />;
    }
    if (profile?.rol === "operador") {
        return <Navigate to="/MenuOperador" replace />;
    }

    // Si no es admin ni operador, lo mandamos a /home
    return <Navigate to="/home" replace />;
  }

  // Si todo está bien, renderizamos la ruta solicitada
  return <Outlet />;
};
