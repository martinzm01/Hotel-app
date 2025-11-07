import React from "react";
import Button from "../components/ui/Button";
import { Pencil, Trash2, User,UserPlus } from "lucide-react";

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
    <article className="overflow-hidden rounded-lg border border-gray-300/90 bg-card  transition-all duration-300 hover:scale-103 hover:shadow-lg bg-gray-50 text-black">
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-light text-foreground flex">
            <User className="text-xl text-gray-900 md:mr-3 sm:mr-2"/>
            {nombre} {apellido}
          </h3>
          <span className="rounded-full bg-[#1D3B2D] px-3 py-1 text-xs font-medium text-white">
            {rol}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground flex">
          {email}
        </p>

        {/* Botones dentro de la tarjeta */}
        <div className="flex gap-2 bg-gray-100 border-1 border-gray-200 rounded">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 cursor-pointer hover:border-1 hover:gray-400"
            onClick={() => onEdit(id)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>

        </div>
      </div>
    </article>
  );
}