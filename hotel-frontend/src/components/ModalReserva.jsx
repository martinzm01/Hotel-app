import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../back_supabase/client";
import Button from "./ui/Button";


export default function ReservaModal({ isOpen, onClose, room }) {
  const { profile } = useAuth(); // Ahora 'profile' tiene {nombre, email, Telefono}

  // Estados del formulario
  const [paymentMethod, setPaymentMethod] = useState("Visa");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaLlegada, setFechaLlegada] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el contador de precio
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  // --- Lógica de autocompletado ---
  useEffect(() => {
    if (isOpen && profile) {
      setNombre(profile.nombre || "");
      setEmail(profile.email || "");
      setTelefono(profile.Telefono || ""); // Tu BDD usa 'T' mayúscula
      
      // Resetea los campos de fecha/comentarios
      setFechaLlegada("");
      setFechaSalida("");
      setComentarios("");
      setError(null);
      setIsSubmitting(false);
      // Resetea el contador
      setTotalPrice(0);
      setTotalDays(0);
    }
  }, [isOpen, profile]); 

  // --- useEffect para calcular el precio total ---
  useEffect(() => {
    if (!fechaLlegada || !fechaSalida || !room) {
      setTotalDays(0);
      setTotalPrice(0);
      return; 
    }

    const fechaInicio = new Date(fechaLlegada);
    const fechaFin = new Date(fechaSalida);

    if (fechaInicio < fechaFin) {
      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      setTotalDays(diffDays);
      setTotalPrice(diffDays * room.precio); 
      
      if (error === "La fecha de salida debe ser posterior a la de llegada.") {
        setError(null);
      }
    } else {
      setTotalDays(0);
      setTotalPrice(0);
      if (fechaLlegada && fechaSalida) {
        setError("La fecha de salida debe ser posterior a la de llegada.");
      }
    }
  }, [fechaLlegada, fechaSalida, room, error]); 


  // Si no está abierto o no hay habitación, no renderiza nada
  if (!isOpen || !room) {
    return null;
  }

  // --- Lógica de Envío a BDD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validación
    const fechaInicio = new Date(fechaLlegada);
    const fechaFin = new Date(fechaSalida);

    if (fechaInicio >= fechaFin) {
      setError("La fecha de salida debe ser posterior a la de llegada.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Calcular Precio Total
      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const precioTotal = diffDays * room.precio; 
      const userId = profile?.id; 

      if (!userId) {
        throw new Error("No se pudo identificar al usuario.");
      }

      // Crear Reserva
      const { data: reservaData, error: reservaError } = await supabase
        .from('reservas')
        .insert({
          id_habitacion: room.id,
          id_usuario: userId,
          fecha_inicio: fechaLlegada,
          fecha_fin: fechaSalida,
          precio_total: precioTotal,
          // --- CORRECCIÓN AQUÍ ---
          // Cambiado de 'pendiente' a 'Pendiente' para que coincida con tu BDD
          estado_reserva: 'Pendiente', 
          // ---------------------
          estado_pago: 'Pendiente de confirmación', // 
        })
        .select('id')
        .single();

      if (reservaError) throw new Error(reservaError.message);
      if (!reservaData) throw new Error("No se pudo crear la reserva.");

      // Crear Pago
      const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
          id_reserva: reservaData.id,
          monto: precioTotal,
          metodo_pago: paymentMethod,
        });

      if (pagoError) throw new Error(pagoError.message);

      alert("¡Reserva realizada con éxito!");
      onClose();

    } catch (apiError) {
      console.error("Error en el proceso de reserva:", apiError.message);
      setError(apiError.message || "No se pudo completar la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NUEVO DISEÑO TAILWIND ---
  return (
    // 1. Fondo (Overlay)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm "
      onClick={onClose}
    >
      {/* 2. Contenido del Modal */}
      <div
        className="relative w-full max-w-2xl p-6 rounded-lg shadow-xl bg-white/70"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 font-extralight hover:text-red-800  cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-semibold text-black dark:text-black">
          Confirmar Reserva
        </h2>

        {/* Label de la Habitación */}
        <div className="mt-4 mb-6 p-3 border-black border-1  rounded-lg bg-white/70 ">
          <p className=" text-black  font-medium">
            Estás reservando: Habitación {room.numero}
          </p>
          <p className="text-sm text-black dark:text-gray-500">
            {room.tipo} (${room.precio} / noche)
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* --- Campos Autocompletados --- */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-black ">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                readOnly
                className="mt-1 w-full rounded-md  bg-white/80 shadow-sm border-gray-100 hover:border-black border-1 pl-3 p-1"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium  text-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 bg-white/80 shadow-sm  p-1 pl-2 "
              />
            </div>
            
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-black">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)} // Permitimos editar el teléfono si quiere
                required
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm focus:border-blue-500 focus:ring-blue-500  bg-white/80 p-1 pl-2 hover:bg-gray-100  text-black"
              />
            </div>

            {/* --- Campos de Fecha --- */}
            <div>
              <label htmlFor="fechaLlegada" className="block text-sm font-medium text-black">
                Fecha de Llegada
              </label>
              <input
                type="date"
                id="fechaLlegada"
                value={fechaLlegada}
                onChange={(e) => setFechaLlegada(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="mt-1 w-full  rounded-md hover:border-black border-gray-100 border-1 shadow-sm bg-white/80 focus:border-blue-500 hover:bg-gray-100 focus:ring-blue-500 p-1 pl-2 "
              />
            </div>

            <div>
              <label htmlFor="fechaSalida" className="block text-sm font-medium text-black">
                Fecha de Salida
              </label>
              <input
                type="date"
                id="fechaSalida"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                min={fechaLlegada || new Date().toISOString().split("T")[0]}
                required
                className="mt-1 w-full p-1 pl-2 rounded-md hover:border-black border-gray-100 border-1 shadow-sm hover:bg-gray-100 focus:border-blue-500 focus:ring-blue-500 text-black bg-white/80"
              />
            </div>

            {/* --- Comentarios y Pago --- */}
            <div className="md:col-span-2">
              <label htmlFor="medioPago" className="block text-sm font-mediumtext-white">
                Medio de Pago
              </label>
              <select
                id="medioPago"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="mt-1 w-full rounded-md  shadow-sm p-1 pl-2 cursor-pointer hover:border-black border-gray-100 border-1 focus:border-blue-500 focus:ring-blue-500 bg-white/80 text-black"
              >
                <option value="Visa">Tarjeta de crédito Visa</option>
                <option value="Mastercard">Tarjeta de crédito Mastercard</option>
                <option value="American Express">Tarjeta de crédito American Express</option>
                <option value="Naranja">Tarjeta Naranja</option>
                <option value="Efectivo">Efectivo (en el local)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="comentarios" className="block text-sm font-medium text-black">
                Comentarios Adicionales
              </label>
              <textarea
                id="comentarios"
                rows="3"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="mt-1 w-full rounded-md p-1 pl-2  shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-black border-black border-1 text-black bg-white/70"
                placeholder="¿Necesitas algo especial? (ej: cuna para bebé...)"
              ></textarea>
            </div>
          </div>
          
          {/* <<< INICIO DE CAMBIO: Display de Precio Total >>> */}
          {totalPrice > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center ">
              <p className="text-lg font-semibold text-blue-800 ">
                Monto Total: ${totalPrice}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Basado en {totalDays} noche(s)
              </p>
            </div>
          )}
          {/* <<< FIN DE CAMBIO >>> */}


          {/* Mensaje de Error */}
          {error && (
            <div className="mt-4 text-center rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Botón de Envío */}
          <div className="mt-6 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center cursor-pointer justify-center px-6 py-2  text-base font-medium rounded-md shadow-sm text-white bg-green-950 hover:bg-green-950 hover:border-2 hover:border-green-950    disabled:bg-gray-400 dark:focus:ring-offset-gray-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Reservando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

