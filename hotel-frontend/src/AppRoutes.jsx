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

function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      {/* --- Rutas Públicas (Visibles para todos) --- */}
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/home" />} />

      {/* --- Rutas Protegidas para Clientes --- */}
      {/* Solo usuarios con rol 'cliente' pueden acceder */}
      <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
        <Route path="/habitaciones" element={<Habitaciones />} />
        <Route path="/historialReservas" element={<HistorialReservas />} />
        <Route path="/consultas" element={<Consultas />} />
      </Route>

      {/* --- Rutas Protegidas para Administradores --- */}
      {/* Solo usuarios con rol 'administrador' pueden acceder */}
      <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
        <Route path="/Admin" element={<Administracion />}>
          {/* Rutas anidadas que se muestran dentro de Administracion.jsx */}
          <Route index element={<Navigate to="habitaciones" replace />} />
          <Route path="habitaciones" element={<AdminHabitaciones />} />
          <Route path="operadores" element={<AdminOperadores />} />
        </Route>
      </Route>
      
      {/* --- Rutas Protegidas para Operadores --- */}
      {/* Solo usuarios con rol 'operador' pueden acceder */}
      <Route element={<ProtectedRoute allowedRoles={['operador']} />}>
        <Route path="Reservas" element={<Reservas />} />
        <Route path="AdminConsultas" element={<AdminConsultas />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="/compras" element={<CompraProveedores />} />
        <Route path="/MenuOperador" element={<PanelOperador />} />

      </Route>

      {/* --- Redirección principal y página no encontrada --- */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ¡ESTA ES LA LÍNEA CORREGIDA!
export default AppRoutes;
