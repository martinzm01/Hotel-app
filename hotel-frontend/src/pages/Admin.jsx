import React from "react";
import { Link, Outlet } from "react-router-dom";
import Nav from "../components/navbar";
export default function Admin() {
  return (
    <div style={{ padding: "1em" }}>
      <Nav/>
      <h2>Panel de Administración</h2>
      <div style={{ marginBottom: "1em" }}>
        <Link to="/AdminHabitaciones" style={{ marginRight: "1em" }}>Administrar Habitaciones</Link>
        <Link to="../Consultas">Responder Consultas</Link>
      </div>

      <Outlet /> {/* Aquí se renderizan las páginas hijas */}
    </div>
  );
}
