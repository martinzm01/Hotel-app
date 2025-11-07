import React from "react";
import Button from "../components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

export default function RoomCardAdmin({
  id,
  name,
  type,
  description,
  price,
  image,
  amenities = [],
  estado = "disponible",
  onEdit,
  onDelete,
}) {

  return (
    <article className="overflow-hidden rounded-lg border border-gray-300/90 bg-card mt-1 mb-1 transition-all duration-300 hover:scale-101 hover:shadow-lg bg-gray-50 text-black">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 "
        />
        <div className="absolute right-4 top-4 rounded-full bg-background/90 px-4 py-2 backdrop-blur-sm bg-white/80">
          <span className="font-serif text-sm font-medium text-primary">${price}</span>
          <span className="text-xs text-muted-foreground">/ noche</span>
        </div>
        <div
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
            estado === "disponible"
            ? "bg-green-500/80 text-white"  // Verde
            : estado === "mantenimiento"
            ? "bg-gray-700/70 text-white"   // Gris
            : "bg-red-500/80 text-white"     // Rojo para el resto (cancelada)
            }`}
        >
          {estado}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl  font-light text-foreground">{name}</h3>
          <span className="rounded-full bg-[#1D3B2D] px-3 py-1 text-xs font-medium text-white">
            {type}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

        {amenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                • {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Botones dentro de la tarjeta */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 cursor-pointer " onClick={() => onEdit(id)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 cursor-pointer" onClick={() => onDelete(id)}>
            <Trash2 className="mr-2 h-4 w-4 " />
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
}
