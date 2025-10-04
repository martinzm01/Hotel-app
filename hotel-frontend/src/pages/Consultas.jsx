import React from "react";

export default function Consultas() {
    return (
        <div style={{ width: "80%", margin: "20px auto", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2>Consultas por Mail</h2>
        <p>¿Tiene alguna pregunta? Envíenos un correo electrónico.</p>
        <button onClick={() => alert("Consulta enviada. Le responderemos a la brevedad.")} style={{ padding: "10px", backgroundColor: "#5cb85c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Enviar Consulta por Mail</button>
        </div>
    );
}
