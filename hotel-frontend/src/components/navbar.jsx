import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: "#444", padding: "0.5em 0", textAlign: "center" }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/habitaciones" style={{ color: "white", textDecoration: "none" }}>Habitaciones</Link></li>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/servicios" style={{ color: "white", textDecoration: "none" }}>Servicios</Link></li>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/reservas" style={{ color: "white", textDecoration: "none" }}>Reservas</Link></li>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/consultas" style={{ color: "white", textDecoration: "none" }}>Consultas</Link></li>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/mapa" style={{ color: "white", textDecoration: "none" }}>Mapa</Link></li>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/admin" style={{ color: "white", textDecoration: "none" }}>Administración</Link></li>
        <li style={{ display: "inline", margin: "0 1em" }}><Link to="/login" style={{ color: "white", textDecoration: "none" }}>Iniciar Sección</Link></li>
      </ul>
    </nav>
  );
}

