//FORMULARIO PARA RESERVAS 

import React, { useState } from "react";
import Footer from "../components/Footer";
const roomPrices = {
  Doble: 120,
  Suite: 180,
  Estándar: 90,
};

export default function ReservaForm() {
  const [roomType, setRoomType] = useState("Estándar");
  const [paymentMethod, setPaymentMethod] = useState("Visa");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaLlegada, setFechaLlegada] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [comentarios, setComentarios] = useState("");

  const handleRoomTypeChange = (event) => setRoomType(event.target.value);
  const handlePaymentMethodChange = (event) => setPaymentMethod(event.target.value);

  return (
    <div
      style={{
        backgroundImage: "url('/assets/spa del hotel.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // hace que el fondo llegue hasta abajo
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(0, 0, 0, 0.6)", //  capa oscura encima
        backgroundBlendMode: "darken",}}    
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "100px auto",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          fontFamily: "'Georgia', serif",
          color: "#222",
        }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "1.5em" }}>Realizar Reserva</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black" }}
              />
            </div>

            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black" }}
              />
            </div>

            <div>
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black" }}
              />
            </div>

            <div>
              <label htmlFor="tipoHabitacion">Tipo de Habitación:</label>
              <select
                id="tipoHabitacion"
                value={roomType}
                onChange={handleRoomTypeChange}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black" }}
              >
                <option value="Estándar">Estándar</option>
                <option value="Doble">Doble</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <div>
              <label htmlFor="fechaLlegada">Fecha de Llegada:</label>
              <input
                type="date"
                id="fechaLlegada"
                value={fechaLlegada}
                onChange={(e) => setFechaLlegada(e.target.value)}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black" }}
              />
            </div>

            <div>
              <label htmlFor="fechaSalida">Fecha de Salida:</label>
              <input
                type="date"
                id="fechaSalida"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="comentarios">Comentarios Adicionales:</label>
              <textarea
                id="comentarios"
                rows="4"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid black", resize: "vertical" }}
              ></textarea>
            </div>

            <div>
              <label htmlFor="precio">Precio:</label>
              <input
                type="text"
                id="precio"
                value={`$${roomPrices[roomType]}`}
                readOnly
                style={{
                  width: "100%",
                  padding: "0.7em",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f9f9f9",
                }}
              />
            </div>

            <div>
              <label htmlFor="medioPago">Medio de Pago:</label>
              <select
                id="medioPago"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                style={{ width: "100%", padding: "0.7em", borderRadius: "5px", border: "1px solid #ddd" }}
              >
                <option value="Visa">Tarjeta de crédito Visa</option>
                <option value="Mastercard">Tarjeta de crédito Mastercard</option>
                <option value="American Express">Tarjeta de crédito American Express</option>
                <option value="Naranja">Tarjeta Naranja</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "2em" }}>
            <button
              style={{
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "12px 25px",
                cursor: "pointer",
                fontSize: "1rem",
                fontFamily: "'Georgia', serif",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#555")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#333")}
            >
              Reservar Ahora
            </button>
          </div>
        </div>
        <Footer/>
      </div>
  );
}
