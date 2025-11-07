import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// AuthProvider no se necesita aquí, está en main.jsx
import { useAuth } from "./context/AuthContext"; 
import { ProtectedRoute } from './components/ProtectedRoute';

// Componentes y Páginas
// HotelNavbar no se necesita aquí, está en App.jsx
import Home from "./pages/home";
import Habitaciones from "./pages/habitaciones";
import Reservas from "./pages/reservas";
import Consultas from "./pages/Consultas";
import Administracion from "./pages/Admin";
import AdminHabitaciones from "./pages/AdminHabitaciones";
import AdminConsultas from "./pages/AdminConsultas";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import Mapa from "./pages/mapa";
import AdminOperadores from "./pages/AdminOperadores";
import HistorialReservas from "./pages/historialReservas";
import CompraProveedores from "./pages/compras";
import PanelOperador from "./pages/MenuOperador";
import DashboardPage from "./pages/dashboard";

function AppRoutes() {
    const { session, profile, loading } = useAuth();

    if (loading) {   ///evita que se rendericen las rutas hasta que se confirme la sesión
        return (
        <div className="flex h-screen justify-center items-center">
            <p className="text-gray-500 text-lg">Cargando sesión...</p>
        </div>
        );
        }
    return (
        <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/home" element={<Home />} />
        <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/home" replace />}
        />

        {/* --- Cliente --- */}
        <Route element={<ProtectedRoute allowedRoles={['cliente']} userRole={profile?.rol} />}>
            <Route path="/habitaciones" element={<Habitaciones />} />
            <Route path="/historialReservas" element={<HistorialReservas />} />
            <Route path="/consultas" element={<Consultas />} />
        </Route>

        {/* --- Administrador --- */}
        <Route element={<ProtectedRoute allowedRoles={['administrador']} userRole={profile?.rol} />}>
            <Route path="/admin" element={<Administracion />}>
            <Route index element={<Navigate to="habitaciones" replace />} />
            <Route path="habitaciones" element={<AdminHabitaciones />} />
            <Route path="operadores" element={<AdminOperadores />} />
            </Route>
            <Route path="dashboard" element={<DashboardPage />} />
        </Route>

        {/* --- Operador --- */}
        <Route element={<ProtectedRoute allowedRoles={['operador']} userRole={profile?.rol} />}>
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/adminconsultas" element={<AdminConsultas />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/compras" element={<CompraProveedores />} />
            <Route path="/menuoperador" element={<PanelOperador />} />
        </Route>

        {/* --- Redirección principal --- */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
);
}
// ¡ESTA ES LA LÍNEA CORREGIDA!
export default AppRoutes;
