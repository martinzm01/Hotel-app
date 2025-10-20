import React, { useEffect } from "react";

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
            <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Panel de Consultas - Administrador
            </h1>
            <p className="text-gray-600">
                Aquí podrás ver y gestionar todas las consultas de los clientes.
            </p>

            {/* Ejemplo: lugar donde luego agregarás la lista de consultas */}
            <div className="mt-8 w-full max-w-4xl bg-white p-6 rounded shadow">
                <p className="text-gray-500">Próximamente: tabla de consultas...</p>
            </div>
            </div>
        );
    }
