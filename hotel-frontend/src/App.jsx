<<<<<<< HEAD
import React from 'react';
// Asumo que tienes estos componentes
import HotelNavbar from './components/navbar'; // Corregí la ruta
import AppRoutes from './AppRoutes'; // Importa el nuevo archivo de rutas
// NO necesitas AuthProvider ni Router/BrowserRouter aquí
=======
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from './components/ProtectedRoute';

// Componentes y Páginas
import HotelNavbar from "./components/navbar";
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
        <Route path="/admin" element={<Administracion />}>
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
      </Route>

      {/* --- Redirección principal y página no encontrada --- */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
>>>>>>> 8e830a6122802191c679ac58eddba87e2d5f15a3

function App() {
  return (
    <> {/* Puedes usar un Fragment (<>) o un <div> */}
      <HotelNavbar />
      <AppRoutes />
      {/* Footer, etc. si lo tienes */}
    </>
  );
}

export default App; // Asegúrate de exportarlo

