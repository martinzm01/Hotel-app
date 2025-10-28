import React from 'react';

export default function ModalPlaceholder({ title, children, onClose, footer }) {
  return (
    <div className="  fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop (fondo) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose} // Cierra el modal si se hace clic fuera
        aria-hidden="true"
      />
      
      {/* Contenido del Modal */}
      {/* --- CAMBIO: Aumentado el ancho a max-w-lg --- */}
      <div className="rounded-lg relative z-10 w-full max-w-lg  bg-white shadow-lg">
        {/* Encabezado */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
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