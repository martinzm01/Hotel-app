import React from "react";
import HotelHeader from "../components/Hotelheader";
import RoomCard from "../components/RoomCard";

export default function Habitaciones() {
  // Datos de ejemplo
  const habitaciones = [
    {
      id: 1,
      numero: 101,
      tipo: "Deluxe",
      descripcion:
        "Espaciosa y moderna, con vistas a la ciudad y servicios premium.",
      precio: 120,
      imagen: "/assets/habitacion1.png",
      amenities: ["WiFi", "TV Smart", "Minibar", "Desayuno incluido"],
      estado: "Disponible",
    },
    {
      id: 2,
      numero: 202,
      tipo: "Suite Ejecutiva",
      descripcion:
        "Diseñada para ofrecer confort y elegancia con sala de estar privada.",
      precio: 180,
      imagen: "/assets/imagen4.jpg",
      amenities: ["WiFi", "Jacuzzi", "Room Service", "Vista panorámica"],
      estado: "Ocupada",
    },
    {
      id: 3,
      numero: 303,
      tipo: "Estándar",
      descripcion:
        "Cómoda y funcional, ideal para estancias cortas o viajes de negocios.",
      precio: 90,
      imagen: "/assets/habitacion 3.png",
      amenities: ["WiFi", "TV", "Aire acondicionado"],
      estado: "Disponible",
    },
  ];

  return (
    <main>
      {/* Header con carrusel */}
      <HotelHeader />

      {/* Sección de contenido */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-4xl font-light text-gray-800">
            Nuestras Habitaciones
          </h2>
          <p className="mt-6 text-center font-sans text-gray-600 max-w-2xl mx-auto">
            Explora nuestras opciones de alojamiento, diseñadas para ofrecerte
            el máximo confort y elegancia durante tu estancia.
          </p>

          {/* Grilla de habitaciones */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {habitaciones.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={`Hab. ${room.numero}`}       // name en RoomCard
                type={room.tipo}                   // type en RoomCard
                description={room.descripcion}     // description en RoomCard
                price={room.precio}                // price en RoomCard
                image={room.imagen}                // image en RoomCard
                amenities={room.amenities}
                estado={room.estado}               // estado 
              />
            ))}

          </div>
        </div>
      </section>
    </main>
  );
}
