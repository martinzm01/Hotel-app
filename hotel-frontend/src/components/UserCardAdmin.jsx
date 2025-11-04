import React from "react";
import Button from "../components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

export default function UserCardAdmin({
  id,
  email,
  nombre,
  apellido,
  rol,
  onEdit,
  onDelete,
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-300/90 bg-card  transition-all duration-300 hover:scale-101 hover:shadow-lg bg-gray-50 text-black">
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-light text-foreground">
            {nombre} {apellido}
          </h3>
          <span className="rounded-full bg-[#1D3B2D] px-3 py-1 text-xs font-medium text-white">
            {rol}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {email}
        </p>

        {/* Botones dentro de la tarjeta */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(id)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
}
