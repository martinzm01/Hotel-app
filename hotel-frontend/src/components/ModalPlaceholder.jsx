import React from 'react';
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

// --- Icono de Cierre (X) ---
const CloseIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function ModalPlaceholder({ title, children, onClose, footer }) {
  return (
    <div className="  fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop (fondo) */}
      <div
        className="absolute inset-0 bg-black/50 hover:text-red/700 backdrop-blur-sm"
        /*onClick={onClose} // Cierra el modal si se hace clic fuera --- anulado*/
        aria-hidden="true"
      />
      
      {/* Contenido del Modal */}
      {/* --- CAMBIO: Aumentado el ancho a max-w-lg --- */}
      <div className="rounded-lg relative z-10 w-full max-w-lg  bg-white/90 shadow-lg">
        {/* Encabezado */}
        <div className="p-4 border-b flex items-start justify-between ">
          <h3 className="text-lg font-medium flex"><CalendarCheck className="text-green-900 mr-3"/>{title}</h3>
            <button
                onClick={onClose}
                className="text-black/70 cursor-pointer flex dark:hover:text-red-500/80"
            >
                <CloseIcon />
            </button>
        </div>
        
        {/* Cuerpo (aquí va tu contenido) */}
        {/* Hacemos que el contenido tenga scroll si es muy largo */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        
        {/* Pie (Footer) --- CAMBIO: Lógica de 'footer' --- */}
        <div className="p-4 border-t flex justify-end gap-2">
          {/* Si le pasas la prop 'footer', renderiza esos botones */}
          {footer ? (
            footer
          ) : (
            /* Si no, usa el botón 'Cerrar' por defecto */
            <button
              onClick={onClose}
              className="rounded-x border px-3 py-2 text-sm hover:bg-gray-500"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}