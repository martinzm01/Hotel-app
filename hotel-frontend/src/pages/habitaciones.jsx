import React from "react";
import RoomCard from "../components/RoomCard";

export default function Habitaciones() {
    return (
        <div style={{ width: "80%", margin: "20px auto", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2>Nuestras Habitaciones</h2>
        <RoomCard
            title="Habitación Estándar"
            description="Cómoda habitación con cama doble, baño privado y TV."
            price="$50.000 por noche"
            image="https://via.placeholder.com/400x200"
        />
        <RoomCard
            title="Habitación Doble"
            description="Habitación con dos camas individuales, baño privado y TV."
            price="$70.000 por noche"
            image="https://via.placeholder.com/400x200"
        />
        <RoomCard
            title="Suite"
            description="Amplia suite con cama king-size, sala de estar, balcón y baño de hidromasaje."
            price="$120.000 por noche"
            image="https://via.placeholder.com/400x200"
        />
        </div>
    );
    }
