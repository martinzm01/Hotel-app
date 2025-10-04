import React from "react";

export default function Admin() {
const handleClick = (msg) => alert(msg);

return (
    <div style={{ width: "80%", margin: "20px auto", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
    <h2>Administración</h2>
    <button onClick={() => handleClick("Reserva liberada.")}>Liberar Reserva</button>
    <button onClick={() => handleClick("Habitación abierta.")}>Abrir Habitación</button>
    </div>
    )}
