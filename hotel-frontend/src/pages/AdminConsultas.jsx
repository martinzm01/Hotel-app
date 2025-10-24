import React, { useEffect } from "react";
import HotelHeader from "../components/headerHabitaciones";
export default function AdminConsultas() {

    // Función que podrías usar luego para manejar consultas
    const adminConsultas = () => {
        console.log("Función adminConsultas ejecutada");
        // Aquí podés agregar la lógica para traer consultas de la DB
    };

    // Llamamos a la función al montar la página
    useEffect(() => {
        adminConsultas();
    }, []);

    return (
            <main >
            <HotelHeader/>
            <div class= "grid grid-cols-1 md:grid-cols-2 gap-8 text-black w-full max-w-[1200px] px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 w-full">
                Panel de Consultas
            </h1>
            <p className="text-gray-600">
                Aquí podrás ver y gestionar todas las consultas de los clientes.
            </p>
            </div>
            </main>
        );
    }
