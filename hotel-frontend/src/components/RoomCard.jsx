import React from "react";
import { Link } from "react-router-dom"; // reemplazo de next/link
import Button from "../components/ui/Button"; // default import

export default function RoomCard({
  id,
  name,
  type,
  description,
  price,
  image,
  amenities = [],
  estado = "Disponible", // nuevo prop
}) {

  return (
    <article className="group overflow-hidden rounded-lg border border-gray-200/90 bg-card transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Precio */}
        <div className="absolute right-4 top-4 rounded-full bg-background/90 px-4 py-2 backdrop-blur-sm">
          <span className="font-serif text-sm font-medium text-primary">${price}</span>
          <span className="text-xs text-muted-foreground">/ noche</span>
        </div>

        {/* Estado */}
        <div
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
            estado === "Disponible"
              ? "bg-green-500/80 text-white"
              : "bg-red-500/80 text-white"
          }`}
        >
          {estado}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-light text-foreground">{name}</h3>
          <span className="rounded-full bg-[#1D3B2D] px-3 py-1 text-xs font-medium text-white">
            {type}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

        {amenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="text-xs text-muted-foreground">
                • {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button asChild className="flex-1" disabled={estado !== "Disponible"}>
            <Link to={`/reservas?room=${id}`}>
              {estado === "Disponible" ? "Reservar Ahora" : "No Disponible"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/habitaciones/${id}`}>Ver Detalles</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}