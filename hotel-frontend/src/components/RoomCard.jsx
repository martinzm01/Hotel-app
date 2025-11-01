import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button"; // Asumo que la ruta es correcta

export default function RoomCard({
  id,
  name,
  type,
  description,
  price,
  image,
  amenities = [],
  estado = "Disponible",
  roomData, // Prop para pasar los datos al modal
  onReserveClick, // Prop para la función que abre el modal
}) {
  // Convertimos el estado a minúsculas para una comparación segura
  const estadoNormalizado = estado.toLowerCase();

  return (
    <article className="group overflow-hidden rounded-lg border hover:scale-101 duration-300 border-gray-300/90 bg-card transition-all hover:shadow-lg bg-gray-50 text-black">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-102"
        />

        {/* Precio */}
        <div className="absolute right-4 top-4 rounded-full bg-background/90 px-4 py-2 backdrop-blur-sm bg-white/50">
          <span className="font-serif text-sm font-medium text-primary">
            ${price}
          </span>
          <span className="text-xs text-muted-foreground">/ noche</span>
        </div>

        {/* Estado */}
        <div
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
            estadoNormalizado === "disponible" // Usar estado normalizado
              ? "bg-green-500/80 text-white"
              : "bg-red-500/80 text-white"
          }`}
        >
          {estado}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-light text-foreground">
            {name}
          </h3>
          <span className="rounded-full bg-[#1D3B2D] px-3 py-1 text-xs font-medium text-white">
            {type}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {amenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1"
              >
                • {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {/* --- BOTÓN DE RESERVA MODIFICADO --- */}
          {/* Ya no es un <Link>, sino un <Button> que llama a 'onReserveClick' */}
          <Button
            onClick={() => onReserveClick(roomData)}
            className="flex-1 cursor-pointer hover:bg-green-900/80"
            disabled={estadoNormalizado !== "disponible"}
          >
            {estadoNormalizado === "disponible"
              ? "Reservar Ahora"
              : "No Disponible"}
          </Button>

          {/* El botón "Ver Detalles" sigue igual */}
          <Button asChild variant="outline">
            <Link to={`/habitaciones/${id}`}>Ver Detalles</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
