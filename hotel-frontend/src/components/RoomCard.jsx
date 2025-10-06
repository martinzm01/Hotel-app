// src/components/RoomCard.jsx
import React from "react";
import { Link } from "react-router-dom"; 
import Button from "../components/ui/Button"; // Asegúrate de que este archivo exista

export function RoomCard({ name, type, description, price, image, amenities = [] }) {
  return (
    <article className="group overflow-hidden rounded-lg border bg-white shadow-md hover:shadow-lg transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full"
        />
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 backdrop-blur-sm">
          <span className="font-serif text-sm font-medium text-primary">${price}</span>
          <span className="text-xs text-muted-foreground"> / noche</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-light text-gray-800">{name}</h3>
          <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium">{type}</span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">{description}</p>

        {amenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="text-xs text-gray-500">
                • {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button>
            <Link to={`/reservas?room=${id}`}>Reservar Ahora</Link>
          </Button>
          <Button variant="outline">
            <Link to={`/habitaciones/${id}`}>Ver Detalles</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
export default RoomCard;
