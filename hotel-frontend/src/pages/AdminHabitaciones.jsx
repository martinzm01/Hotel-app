import React, { useEffect, useState } from "react";
import { supabase } from "../back_supabase/client";
import RoomCard from "../components/RoomCard";
import Button from "../components/ui/Button";

export default function AdminHabitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar habitaciones desde Supabase
  useEffect(() => {
    const cargarHabitaciones = async () => {
      const { data, error } = await supabase.from("habitaciones").select("*");
      if (error) {
        console.error("Error al cargar habitaciones:", error.message);
      } else {
        setHabitaciones(data);
      }
      setCargando(false);
    };

    cargarHabitaciones();
  }, []);

  if (cargando) {
    return <p className="text-center text-muted-foreground">Cargando habitaciones...</p>;
  }

  return (
    <section className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground">Administrar Habitaciones</h1>
        <Button onClick={() => alert("Abrir formulario para agregar nueva habitación")}>
          + Nueva Habitación
        </Button>
      </div>

      {/* Grid de habitaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.map((habitacion) => (
          <RoomCard key={habitacion.id} {...habitacion} />
        ))}
      </div>
    </section>
  );
}
