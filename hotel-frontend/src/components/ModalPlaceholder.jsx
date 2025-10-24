import React from 'react';

// Añadimos 'export default' para que pueda ser importado
export default function ModalPlaceholder({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop (fondo) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose} // Cierra el modal si se hace clic fuera
        aria-hidden="true"
      />
      
      {/* Contenido del Modal */}
      <div className="relative z-10 w-full max-w-md rounded bg-white shadow-lg">
        {/* Encabezado */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        
        {/* Cuerpo (aquí va tu contenido) */}
        <div className="p-4 space-y-4">{children}</div>
        
        {/* Pie (Footer) */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}