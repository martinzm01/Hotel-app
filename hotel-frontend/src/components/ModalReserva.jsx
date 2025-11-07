import React, { useState, useEffect } from "react";
// --- NUEVO: Imports de DatePicker ---
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// --- FIN NUEVO ---
import { useAuth } from "../context/AuthContext";
// --- NUEVO: Import de icono de tarjeta ---
import { X, Loader2, CreditCard } from "lucide-react"; 
// --- FIN NUEVO ---
import { supabase } from "../back_supabase/client";
import Button from "./ui/Button";
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

// --- NUEVO: Funciones Helper para fechas (Sin cambios) ---
const formatDateToString = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseStringToDate = (dateString) => {
  if (!dateString) return null;
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

  // Estados para fechas ocupadas
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // --- NUEVO: Estados para campos de pago simulados (no se guardan) ---
  const [dni, setDni] = useState("");
  const [cardType, setCardType] = useState("credito");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
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
      setOccupiedDates([]);
      
      // --- NUEVO: Resetear campos simulados ---
      setDni("");
      setCardType("credito");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      // --- FIN NUEVO ---
    }
  }, [isOpen, profile]); 

  // --- useEffect para cargar fechas (Sin cambios) ---
  useEffect(() => {
    if (isOpen && room?.id) { 
      const fetchOccupiedDates = async () => {
        setIsLoadingDates(true);
        const { data, error } = await supabase.rpc('get_fechas_ocupadas', {
          p_id_habitacion: room.id
        });

        if (error) {
          console.error("Error fetching dates via RPC:", error);
        }

        if (data) {
          const intervals = data.map(reserva => {
            const start = parseStringToDate(reserva.fecha_inicio);
            const end = parseStringToDate(reserva.fecha_fin);
            if (end) {
                end.setDate(end.getDate() - 1); 
            }
            return { start, end };
          });
          setOccupiedDates(intervals);
        }
        setIsLoadingDates(false);
      };
      fetchOccupiedDates();
    }
  }, [isOpen, room?.id]);


  // --- useEffect para calcular el precio total (Sin cambios) ---
  useEffect(() => {
    if (!fechaLlegada || !fechaSalida || !room) {
      setTotalDays(0);
      setTotalPrice(0);
      return; 
    }
    
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


  // --- Validación (Sin cambios) ---
  if (!isOpen || !room) {
    return null;
  }

  // --- Lógica de Envío a BDD (Sin cambios en la lógica) ---
  // Sigue guardando solo lo necesario (metodo_pago, monto, etc.)
  // e ignora los nuevos estados (dni, cardNumber, etc.)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fechaInicio = parseStringToDate(fechaLlegada);
    const fechaFin = parseStringToDate(fechaSalida);

    if (fechaInicio >= fechaFin) {
      setError("La fecha de salida debe ser posterior a la de llegada.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: existingBookingsData, error: checkError } = await supabase.rpc('get_fechas_ocupadas', {
        p_id_habitacion: room.id
      });

      if (checkError) {
        throw new Error("Error al verificar disponibilidad. Intente de nuevo.");
      }

      if (existingBookingsData) {
        const newStart = fechaInicio;
        const newEnd = fechaFin; 

        for (const reserva of existingBookingsData) {
          const existingStart = parseStringToDate(reserva.fecha_inicio);
          const existingEnd = parseStringToDate(reserva.fecha_fin);
          const overlap = newStart < existingEnd && newEnd > existingStart;

          if (overlap) {
            throw new Error("¡Ups! Alguien acaba de reservar estas fechas. Por favor, selecciona otras.");
          }
        }
      }

      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const precioTotal = diffDays * room.precio; 
      const userId = profile?.id; 

      if (!userId) {
        throw new Error("No se pudo identificar al usuario.");
      }

      const { data: reservaData, error: reservaError } = await supabase
        .from('reservas')
        .insert({
          id_habitacion: room.id,
          id_usuario: userId,
          fecha_inicio: fechaLlegada,
          fecha_fin: fechaSalida,   
          precio_total: precioTotal,
          estado_reserva: 'Pendiente', 
          estado_pago: 'Pendiente de confirmación', 
        })
        .select('id')
        .single();

      if (reservaError) throw new Error(reservaError.message);
      if (!reservaData) throw new Error("No se pudo crear la reserva.");

      const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
          id_reserva: reservaData.id,
          monto: precioTotal,
          metodo_pago: paymentMethod, // <-- Solo se guarda este dato de pago
        });

      if (pagoError) throw new Error(pagoError.message);

      alert("¡Reserva realizada con éxito!");
      onClose();

    } catch (apiError) {
      console.error("Error en el proceso de reserva:", apiError.message);
      setError(apiError.message || "No se pudo completar la reserva.");
      
      if (apiError.message.includes("¡Ups!")) {
         setOccupiedDates([]); 
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DISEÑO TAILWIND MODIFICADO ---
  return (
    // 1. Fondo (Overlay)
    // 1. Fondo (Overlay)
  <div
    className="fixed inset-0 z-20 flex items-center justify-center p-4 pt-10  bg-black/60 backdrop-blur-sm overflow-y-auto"
  >
    {/* 2. Contenido del Modal */}
    <div
      className="
        relative w-full max-w-xl sm:max-w-lg md:max-w-2xl 
        max-h-[85vh] overflow-y-auto mt-20
        p-6 pb-4 pt-4 rounded-lg shadow-lg 
        bg-white/90 mb-4 
      "
      onClick={(e) => e.stopPropagation()}
    >
        <div className="flex" >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 font-extralight hover:text-red-800 cursor-pointer"
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

        {/* Label de la Habitación (Sin cambios) */}
        <div className="mt-4 mb-6 p-3 border-black border-1 rounded-lg bg-white/70 ">
          <p className=" text-black font-medium">
            Estás reservando: Habitación {room.numero}
          </p>
          <p className="text-sm text-black dark:text-gray-500">
            {room.tipo} (${room.precio} / noche)
          </p>
          {isLoadingDates && (
            <p className="text-sm text-blue-600 animate-pulse">
              Cargando disponibilidad...
            </p>
          )}
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
                className="mt-1 w-full rounded-md bg-white/80 shadow-sm border-gray-100 hover:border-black border-1 pl-3 p-1"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="mt-1 w-full rounded-md hover:border-black focus:ring-blue-500 border-gray-100 border-1 bg-white/80 shadow-sm p-1 pl-2 "
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
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/80 p-1 pl-2 hover:bg-gray-100 text-black"
              />
            </div>

            {/* --- NUEVO: Campo DNI --- */}
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-black">
                DNI
              </label>
              <input
                type="text"
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required // Lo hacemos requerido para la simulación
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/80 p-1 pl-2 hover:bg-gray-100 text-black"
                placeholder="Ingrese su DNI"
              />
            </div>
            {/* --- FIN NUEVO --- */}

            {/* --- Campos de Fecha (Sin cambios) --- */}
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
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm bg-white/80 focus:border-blue-500 hover:bg-gray-100 focus:ring-blue-500 p-1 pl-2 "
              />
            </div>

            <div>
              <label htmlFor="fechaSalida" className="block text-sm font-medium text-black">
                Fecha de Salida
              </label>
              <DatePicker
                id="fechaSalida"
                selected={parseStringToDate(fechaSalida)}
                onChange={(date) => setFechaSalida(formatDateToString(date))}
                excludeDateIntervals={occupiedDates}
                minDate={fechaLlegada 
                  ? new Date(parseStringToDate(fechaLlegada).getTime() + 86400000) 
                  : new Date()
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                required
                disabled={isLoadingDates || !fechaLlegada}
                className="mt-1 w-full p-1 pl-2 rounded-md hover:border-black border-gray-100 border-1 shadow-sm hover:bg-gray-100 focus:border-blue-500 focus:ring-blue-500 text-black bg-white/80"
              />
            </div>
          </div>
            
          {/* --- NUEVO: Separador de Sección de Pago --- */}
          <div className="mt-6 pt-4 border-t border-gray-400">
             <h3 className="text-lg font-semibold text-black flex items-center">
                <CreditCard className="mr-2 text-gray-700"/>
                Datos de Pago (Simulación)
             </h3>
          </div>
          {/* --- FIN NUEVO --- */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
            {/* --- Medio de Pago (Sin cambios) --- */}
            <div className="md:col-span-2">
              <label htmlFor="medioPago" className="block text-sm font-medium text-black">
                Seleccione Tarjeta (Este dato sí se guarda)
              </label>
              <select
                id="medioPago"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="mt-1 w-full rounded-md shadow-sm p-1 pl-2 cursor-pointer hover:border-black border-gray-100 border-1 focus:border-blue-500 focus:ring-blue-500 bg-white/80 text-black"
              >
                <option value="Visa">Tarjeta de crédito Visa</option>
                <option value="Mastercard">Tarjeta de crédito Mastercard</option>
                <option value="American Express">Tarjeta de crédito American Express</option>
                <option value="Naranja">Tarjeta Naranja</option>
                <option value="Efectivo">Efectivo (en el local)</option>
              </select>
            </div>



            {/* --- NUEVO: Número de Tarjeta --- */}
            <div className="md:col-span-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-black">
                Número de Tarjeta
              </label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/80 p-1 pl-2 hover:bg-gray-100 text-black"
                placeholder="0000 0000 0000 0000"
                autoComplete="off"
              />
            </div>
            {/* --- FIN NUEVO --- */}

            {/* --- NUEVO: Vencimiento --- */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-black">
                Vencimiento
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/80 p-1 pl-2 hover:bg-gray-100 text-black"
                placeholder="MM/AA"
                autoComplete="off"
              />
            </div>
            {/* --- FIN NUEVO --- */}
            
            {/* --- NUEVO: CVV --- */}
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-black">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
                className="mt-1 w-full rounded-md hover:border-black border-gray-100 border-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/80 p-1 pl-2 hover:bg-gray-100 text-black"
                placeholder="123"
                autoComplete="off"
              />
            </div>
            {/* --- FIN NUEVO --- */}
            
            {/* --- Comentarios (Movido después del pago) --- */}
            <div className="md:col-span-2 pt-4 border-t border-gray-400 mt-4">
              <label htmlFor="comentarios" className="block text-sm font-medium text-black">
                Comentarios Adicionales
              </label>
              <textarea
                id="comentarios"
                rows="3"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="mt-1 w-full rounded-md p-1 pl-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-black border-black border-1 text-black bg-white/70"
                placeholder="¿Necesitas algo especial? (ej: cuna para bebé...)"
              ></textarea>
            </div>
          </div>
          
          {/* --- Display de Precio Total (Sin cambios) --- */}
          {totalPrice > 0 && (
            <div className="mt-1 p-4 pt-1 pb-2 bg-blue-50 border border-blue-200 rounded-lg text-center ">
              <p className="text-md font-semibold text-blue-800 ">
                Monto Total: ${totalPrice}
              </p>
              <p className="text-sm text-gray-800 ">
                Basado en {totalDays} noche(s)
              </p>
            </div>
          )}


          {/* Mensaje de Error (Sin cambios) */}
          {error && (
            <div className="mt-4 text-center rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Botón de Envío (Sin cambios) */}
          <div className="mt-6 text-right">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingDates}
              className="inline-flex items-center cursor-pointer justify-center px-6 py-2 text-base font-medium rounded-md shadow-sm text-white bg-green-950 hover:bg-green-950/70 hover:border-1 hover:border-green-950/50 "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Reservando...
                </>
              ) : (
                "Confirmar Reserva y Pagar" // Texto actualizado del botón
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}