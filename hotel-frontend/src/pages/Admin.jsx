import React from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

export default function Admin() {
  return (

    <div style={{ padding: "1em" }}>
      <Navbar /> 
      
      <h2>Panel de Administración</h2>
      <div style={{ marginBottom: "1em" }}>
        <Link to="/admin/habitaciones" style={{ marginRight: "1em" }}>Administrar Habitaciones</Link>
        <Link to="/admin/consultas">Responder Consultas</Link>
      </div>

      <Outlet /> {/* Aquí se renderizan las páginas hijas */}
    </div>
  );
}
