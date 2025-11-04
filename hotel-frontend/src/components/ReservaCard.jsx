// 1. IMPORTAMOS useState
import React, { useState } from 'react';
// 2. IMPORTAMOS supabase
import { supabase } from '../back_supabase/client';
import ModalDetalleReservaCliente from './ModalDetalleReservaCliente'; // Ajusta la rutal
import { 
  FaCalendarAlt, 
  FaUserFriends,
  FaCheckCircle, 
  FaExclamationCircle, 
  FaTimesCircle,
  FaDollarSign 
} from 'react-icons/fa';

// Configuración de estado (sin cambios)
const statusConfig = {
  Activa: {
    bg: 'bg-green-400/90',
    text: 'text-white',
    icon: <FaCheckCircle className="inline mr-1 mb-0.5" />,
  },
  Pendiente: {
    bg: 'bg-yellow-500/80',
    text: 'text-white',
    icon: <FaExclamationCircle className="inline mr-1 mb-0.5" />,
  },
  Cancelada: {
    bg: 'bg-red-500/80',
    text: 'text-white',
    icon: <FaTimesCircle className="inline mr-1 mb-0.5" />,
  },
  Finalizada: { 
      bg: 'bg-gray-500/80',
      text: 'text-white',
      icon: <FaCheckCircle className="inline mr-1 mb-0.5" />,
    },
  Confirmada:{
    bg: 'bg-blue-950/80',
    text: 'text-white',
    icon: <FaCheckCircle className="inline mr-1 mb-0.5" />,
  },
  'default': { 
    bg: 'bg-gray-400/80',
    text: 'text-white',
    icon: <FaExclamationCircle className="inline mr-1 mb-0.5" />,
  }
};

// Helper de fecha (sin cambios)
const formatSimpleDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};


const ReservaCard = ({ reserva,onUpdate }) => {

  // AHORA ESTO FUNCIONA (porque importamos useState)
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- NUEVO ESTADO

  // Adaptación de datos (sin cambios)
  const {
    id,
    fecha_inicio,
    fecha_fin,
    precio_total,
    estado_reserva,
    habitaciones
  } = reserva;


  const habitacionTipo = habitaciones?.tipo || 'Habitación';
  const habitacionNumero = habitaciones?.numero;
  const habitacionNombre = habitacionNumero 
  ? `Hab. ${habitacionNumero} - ${habitacionTipo}` 
  : habitacionTipo;
  const habitacionImagen = habitaciones?.imagen_url || '/placeholder.svg';
  const checkIn = formatSimpleDate(fecha_inicio);
  const checkOut = formatSimpleDate(fecha_fin);
  const precioTotal = precio_total || 0;
  const estado = estado_reserva || 'Pendiente';

  // Lógica de cancelación (AHORA FUNCIONA porque importamos supabase)
  const handleCancel = async () => {
    if (isCancelling) return;
    const isConfirmed = window.confirm("¿Estás seguro de que deseas cancelar esta reserva?");
    if (!isConfirmed) return;

    setIsCancelling(true);
    try {
      const { error } = await supabase // <-- Esta línea ya es válida
        .from('reservas')
        .update({ estado_reserva: 'Cancelada' })
        .eq('id', id);

      if (error) { throw error; }

      alert("Reserva cancelada exitosamente.");
      if (onUpdate) { onUpdate(); }

    } catch (error) {
      alert("Error al cancelar la reserva: " + error.message);
      setIsCancelling(false);
    }
  };

  const nonCancellableStates = ['Cancelada', 'Finalizada'];
  const statusStyle = statusConfig[estado] || statusConfig['default'];

return (
    // 3. Añadimos un Fragment (<>) para poder renderizar el modal
    <> 
      <article className="group overflow-hidden rounded-lg border ml-5 mr-5 mb-5 cursor-pointer border-gray-300/90 bg-gray-50 text-black transition-all hover:scale-102 duration-300 hover:shadow-lg">
        
        {/* --- (Toda la parte de imagen y cuerpo no cambia) --- */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={habitacionImagen} 
            alt={`Imagen de ${habitacionNombre}`}
            className="object-cover w-full h-full transition-transform duration-500"
          />
          <div className="absolute left-4 top-4 rounded-full bg-gray-500/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Reserva #{id}
          </div>
          <div
            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.icon}
            {estado}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-serif text-2xl font-light text-foreground truncate">
              {habitacionNombre}
            </h3>
          </div>
          <div className="mb-4 flex items-center text-gray-600">
            <FaCalendarAlt className="text-indigo-500 mr-2" />
            <span className="text-sm font-medium">
              {checkIn} <span className="text-gray-400 mx-1">→</span> {checkOut}
            </span>
          </div>
          <div className="mb-4 flex items-center text-gray-700">
            <FaDollarSign className="mr-2 text-green-600" />
            <span className="text-sm">
              <span className="font-medium">${precioTotal.toFixed(2)}</span>
              <span className="text-gray-500"> (Total)</span>
            </span>
          </div>

          {/* --- 4. SECCIÓN DE BOTONES ACTUALIZADA --- */}
          <div className="flex gap-3 mt-4">
            
            {/* ¡CAMBIO CLAVE AQUÍ! */}
            <button 
              className="flex-1 bg-green-950 text-white font-bold py-2 px-4 rounded-lg transition duration-300 cursor-pointer hover:bg-green-950/70"
              onClick={() => setIsModalOpen(true)} // <-- ABRE EL MODAL
            >
              Ver Detalles
            </button>
            
            {!nonCancellableStates.includes(estado) && (
              <button 
                className="flex-1 bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 hover:bg-red-400 cursor-pointer disabled:opacity-50"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar'}
              </button>
            )}
          </div>
        </div>
      </article>

      {/* 5. RENDERIZADO CONDICIONAL DEL MODAL */}
      {isModalOpen && (
        <ModalDetalleReservaCliente
          reserva={reserva}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
export default ReservaCard;