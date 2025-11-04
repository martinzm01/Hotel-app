import React, { useState, useEffect } from "react";
// --- NUEVO: Imports de DatePicker ---
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// --- FIN NUEVO ---
import { useAuth } from "../context/AuthContext";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../back_supabase/client";
import Button from "./ui/Button";
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

// --- NUEVO: Funciones Helper para fechas ---
// Para evitar problemas de zona horaria (timezone)
const formatDateToString = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseStringToDate = (dateString) => {
  if (!dateString) return null;
  // Se usa T00:00:00 para asegurar que se parsee como fecha local
  return new Date(dateString + 'T00:00:00');
};
// --- FIN NUEVO ---


export default function ReservaModal({ isOpen, onClose, room }) {
  // --- INICIO: Todos los Hooks deben ir aquí ---
  const { profile } = useAuth(); 

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

  // --- NUEVO: Estados para fechas ocupadas ---
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  // --- FIN NUEVO ---

  // --- Lógica de autocompletado ---
  useEffect(() => {
    if (isOpen && profile) {
      setNombre(profile.nombre || "");
      setEmail(profile.email || "");
      setTelefono(profile.Telefono || ""); 
      
      setFechaLlegada("");
      setFechaSalida("");
      setComentarios("");
      setError(null);
      setIsSubmitting(false);
      setTotalPrice(0);
      setTotalDays(0);
      
      // --- MODIFICADO: Resetear fechas ---
      setOccupiedDates([]);
    }
  }, [isOpen, profile]); 

  // --- MODIFICADO: useEffect para cargar fechas con RPC ---
  useEffect(() => {
    // Usamos room?.id para seguridad
    if (isOpen && room?.id) { 
      const fetchOccupiedDates = async () => {
        setIsLoadingDates(true);
        
        // Se llama a la función RPC en lugar de consultar la tabla
        const { data, error } = await supabase.rpc('get_fechas_ocupadas', {
          p_id_habitacion: room.id
        });

        console.log("1. Datos crudos de Supabase (RPC):", data);
        // --- FIN DEBUGGING ---

        if (error) {
          console.error("Error fetching dates via RPC:", error);
        }

        if (data) {
          const intervals = data.map(reserva => {
            const start = parseStringToDate(reserva.fecha_inicio);
            const end = parseStringToDate(reserva.fecha_fin);
            
            // La fecha fin es el día de checkout, se bloquea HASTA el día anterior
            if (end) {
                end.setDate(end.getDate() - 1); 
            }
            return { start, end };
          });
          
          // --- INICIO DEBUGGING ---
          console.log("2. Intervalos para DatePicker:", intervals);
          // --- FIN DEBUGGING ---

          setOccupiedDates(intervals);
        }
        setIsLoadingDates(false);
      };

      fetchOccupiedDates();
    }
  }, [isOpen, room?.id]); // Depende de room.id (con optional chaining)
  // --- FIN MODIFICADO ---


  // --- useEffect para calcular el precio total ---
  useEffect(() => {
    if (!fechaLlegada || !fechaSalida || !room) {
      setTotalDays(0);
      setTotalPrice(0);
      return; 
    }
    
    // --- MODIFICADO: Usar parser seguro ---
    const fechaInicio = parseStringToDate(fechaLlegada);
    const fechaFin = parseStringToDate(fechaSalida);
    
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
  // --- FIN: Todos los Hooks declarados ---



  // --- MODIFICADO: Esta validación DEBE ir DESPUÉS de todos los Hooks ---
  if (!isOpen || !room) {
    return null;
  }
  // --- FIN MODIFICADO ---


  // --- Lógica de Envío a BDD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // --- MODIFICADO: Usar parser seguro ---
    const fechaInicio = parseStringToDate(fechaLlegada);
    const fechaFin = parseStringToDate(fechaSalida);

    if (fechaInicio >= fechaFin) {
      setError("La fecha de salida debe ser posterior a la de llegada.");
      setIsSubmitting(false);
      return;
    }

    try {
      // --- MODIFICADO: Doble chequeo de seguridad con RPC ---
      // Volvemos a llamar a la RPC para obtener los datos MÁS RECIENTES
      const { data: existingBookingsData, error: checkError } = await supabase.rpc('get_fechas_ocupadas', {
        p_id_habitacion: room.id
      });
      // --- FIN MODIFICADO ---

      if (checkError) {
        throw new Error("Error al verificar disponibilidad. Intente de nuevo.");
      }

      // --- NUEVO: Lógica de superposición en JavaScript ---
      if (existingBookingsData) {
        const newStart = fechaInicio; // Tu fecha de llegada (JS Date)
        const newEnd = fechaFin;     // Tu fecha de salida (JS Date)

        for (const reserva of existingBookingsData) {
          const existingStart = parseStringToDate(reserva.fecha_inicio);
          const existingEnd = parseStringToDate(reserva.fecha_fin);

          // Lógica de superposición:
          // (Mi reserva empieza ANTES de que termine una existente)
          // Y (Mi reserva termina DESPUÉS de que empiece una existente)
          const overlap = newStart < existingEnd && newEnd > existingStart;

          if (overlap) {
            // Si hay superposición, lanza el error
            throw new Error("¡Ups! Alguien acaba de reservar estas fechas. Por favor, selecciona otras.");
          }
        }
      }
      // --- FIN NUEVO ---


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
          fecha_inicio: fechaLlegada, // Se guarda el string 'YYYY-MM-DD'
          fecha_fin: fechaSalida,      // Se guarda el string 'YYYY-MM-DD'
          precio_total: precioTotal,
          estado_reserva: 'Pendiente', 
          estado_pago: 'Pendiente de confirmación', 
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
      
      // --- NUEVO: Recargar fechas si hay error de superposición ---
      if (apiError.message.includes("¡Ups!")) {
         // Forzamos la recarga del useEffect de fechas
         setOccupiedDates([]); 
      }
      // --- FIN NUEVO ---
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NUEVO DISEÑO TAILWIND ---
  return (
    // 1. Fondo (Overlay)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm "
    >
      {/* 2. Contenido del Modal */}
      <div
        className="relative w-full max-w-xl p-6 pb-4 pt-4 rounded-lg shadow-lg bg-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex" >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 font-extralight hover:text-red-800  cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>
        {/* Título */}
        <h2 className="text-2xl font-semibold text-black dark:text-black flex ">
        <CalendarCheck className="mr-3 text-green-900"/>
         Realizar Reserva
        </h2>

        </div>
        {/* Botón de Cerrar */}

        {/* Label de la Habitación */}
        <div className="mt-4 mb-6 p-3 border-black border-1  rounded-lg bg-white/70 ">
          <p className=" text-black  font-medium">
            Estás reservando: Habitación {room.numero}
          </p>
          <p className="text-sm text-black dark:text-gray-500">
            {room.tipo} (${room.precio} / noche)
          </p>
          {/* --- NUEVO: Indicador de carga --- */}
          {isLoadingDates && (
            <p className="text-sm text-blue-600 animate-pulse">
              Cargando disponibilidad...
            </p>
          )}
          {/* --- FIN NUEVO --- */}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* --- Campos Autocompletados (Sin cambios) --- */}
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
                className="mt-1 w-full rounded-md hover:border-black focus:ring-blue-500  border-gray-100 border-1 bg-white/80 shadow-sm  p-1 pl-2 "
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

            {/* --- REEMPLAZO: Input de Fecha Llegada --- */}
            <div>
              <label htmlFor="fechaLlegada" className="block text-sm font-medium text-black">
                Fecha de Llegada
              </label>
              <DatePicker
                id="fechaLlegada"
                selected={parseStringToDate(fechaLlegada)}
                onChange={(date) => setFechaLlegada(formatDateToString(date))}
                excludeDateIntervals={occupiedDates}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                required
                disabled={isLoadingDates}
                // Copiamos las clases de tu input original
                className="mt-1 w-full  rounded-md hover:border-black border-gray-100 border-1 shadow-sm bg-white/80 focus:border-blue-500 hover:bg-gray-100 focus:ring-blue-500 p-1 pl-2 "
              />
            </div>
            {/* --- FIN REEMPLAZO --- */}

            {/* --- REEMPLAZO: Input de Fecha Salida --- */}
            <div>
              <label htmlFor="fechaSalida" className="block text-sm font-medium text-black">
                Fecha de Salida
              </label>
              <DatePicker
                id="fechaSalida"
                selected={parseStringToDate(fechaSalida)}
                onChange={(date) => setFechaSalida(formatDateToString(date))}
                excludeDateIntervals={occupiedDates}
                // La fecha de salida debe ser 1 día después de la llegada
                minDate={fechaLlegada 
                  ? new Date(parseStringToDate(fechaLlegada).getTime() + 86400000) 
                  : new Date()
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                required
                disabled={isLoadingDates || !fechaLlegada} // Deshabilitado si no hay fecha de llegada
                // Copiamos las clases de tu input original
                className="mt-1 w-full p-1 pl-2 rounded-md hover:border-black border-gray-100 border-1 shadow-sm hover:bg-gray-100 focus:border-blue-500 focus:ring-blue-500 text-black bg-white/80"
              />
            </div>
            {/* --- FIN REEMPLAZO --- */}


            {/* --- Comentarios y Pago (Sin cambios) --- */}
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
            <div className="mt-1 p-4 pt-1  pb-2 bg-blue-50 border border-blue-200 rounded-lg text-center ">
              <p className="text-md font-semibold text-blue-800 ">
                Monto Total: ${totalPrice}
              </p>
              <p className="text-sm text-gray-800 ">
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
              // --- MODIFICADO: Deshabilitar si está cargando fechas ---
              disabled={isSubmitting || isLoadingDates}
              className="inline-flex items-center cursor-pointer justify-center px-6 py-2  text-base font-medium rounded-md shadow-sm text-white bg-green-950 hover:bg-green-950/70 hover:border-1 hover:border-green-950/50  "
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