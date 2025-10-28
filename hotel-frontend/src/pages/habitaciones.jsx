import React, { useState, useEffect } from "react";
// 1. IMPORTA TU CLIENTE DE SUPABASE (asegúrate que la ruta sea correcta)
import { supabase } from "../back_supabase/client"; 

import HeaderHabitaciones from "../components/headerHabitaciones";
import RoomCard from "../components/RoomCard";
import Footer from "../components/footer";

export default function Habitaciones() {
  // 2. DATOS AHORA SON ESTADOS: uno para la lista, uno para carga, uno para error
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. useEffect PARA CARGAR DATOS DESDE SUPABASE
  useEffect(() => {
    async function fetchHabitaciones() {
      try {
        setLoading(true); // Empezamos a cargar
        
        // 4. LA CONSULTA A SUPABASE
        // Asume que tu tabla se llama 'habitaciones'
        const { data, error } = await supabase
          .from('habitaciones') // <-- Nombre exacto de tu tabla
          .select('*');         // <-- Trae todas las columnas

        if (error) {
          throw error; // Lanza el error si Supabase falla
        }

        if (data) {
          setHabitaciones(data); // Guarda los datos en el estado
        }

      } catch (error) {
        console.error("Error cargando datos:", error.message);
        setError(error.message);
      } finally {
        setLoading(false); // Deja de cargar (sea éxito o error)
      }
    }

    fetchHabitaciones(); // Llama a la función
  }, []); // El [] asegura que se ejecute solo una vez al montar

  // 5. MANEJO DE ESTADOS DE CARGA Y ERROR
  
  // Muestra un mensaje mientras carga
  if (loading) {
    return (
      <main>
        <HeaderHabitaciones />
        <section className="py-20 bg-gray-50 text-center">
          <p className="text-xl">Cargando habitaciones...</p>
        </section>
        <Footer />
      </main>
    );
  }

  // Muestra un mensaje si hay un error
  if (error) {
    return (
      <main>
        <HeaderHabitaciones />
        <section className="py-20 bg-gray-50 text-center">
          <p className="text-xl text-red-600">Error al cargar: {error}</p>
        </section>
        <Footer />
      </main>
    );
  }

  // 6. RENDERIZADO NORMAL (CUANDO YA CARGÓ)
  return (
    <main>
      {/* Header con carrusel */}
      <HeaderHabitaciones />

      {/* Sección de contenido */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Grilla de habitaciones */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* 7. MAPEAMOS EL ESTADO (que viene de Supabase) */}
            {habitaciones.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                // Asumimos que los nombres de columnas en Supabase
                // coinciden con los del array original
                name={`Hab. ${room.numero}`} 
                type={room.tipo}
                description={room.descripcion}
                price={room.precio}
                image={room.imagen_url} // <-- Asegúrate que esto sea la URL/path
                amenities={room.servicios}
                estado={room.estado}
              />
            ))}
          </div>
          
          {/* Mensaje por si no hay habitaciones */}
          {habitaciones.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              No se encontraron habitaciones disponibles.
            </p>
          )}

        </div>
      </section>
      <Footer />
    </main>
  );
}
