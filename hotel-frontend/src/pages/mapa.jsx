// ----------------------------------------------------------------------
// Archivo: MapaOcupacion.jsx
// ----------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../back_supabase/client"; // Ajusta la ruta a tu cliente Supabase
import ModalPlaceholder from "../components/ModalPlaceholder"; // Ajusta la ruta a tu componente Modal
import ModalDetalleReserva from "../components/ModalDetalleReserva"
import Hotelheader from "../components/headerHabitaciones"
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

// Importamos las funciones de date-fns
import {
  format,
  addDays,
  eachDayOfInterval,
  parseISO,
  startOfToday,
  differenceInDays // Necesario para calcular el precio
} from "date-fns";
import { es } from "date-fns/locale";

// --- Iconos Inline ---
const BedIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 7v7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M21 14V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M3 10h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockOpenIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Defino los estados que cuentan como "Ocupada" (Usa la convención de tu BDD)
const blockingStates = ["Pendiente", "Confirmada", "Activa"]; // O ['pendiente', 'confirmada', 'activa']

// --- Componente Principal ---
export default function MapaOcupacion() {
  // --- Estados ---
  const [rooms, setRooms] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [isLoading, setIsLoading] = useState(true); // Inicia cargando
  const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false);
  const [isNuevaReservaOpen, setIsNuevaReservaOpen] = useState(false);
  const [isDetalleReservaOpen, setIsDetalleReservaOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // --- Generación de Fechas (con useMemo) ---
  const daysToShow = 14;
  const startDate = useMemo(() => new Date(currentDate), [currentDate]);
  const endDate = useMemo(() => addDays(startDate, daysToShow - 1), [startDate]);
  const dates = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

  // --- Carga de Datos (Efecto Principal) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true); // Siempre mostrar carga al iniciar fetch
    try {
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      // Traemos habitaciones
      const { data: habitacionesData, error: habitacionesError } = await supabase
        .from("habitaciones")
        .select("*")
        .order("numero", { ascending: true });
      if (habitacionesError) throw habitacionesError;
      setRooms(habitacionesData || []);

      // Traemos reservas y el número de habitación asociado (si tienes relación FK llamada 'habitaciones')
// --- CAMBIO AQUÍ en el select de reservas ---
      const { data: reservasData, error: reservasError } = await supabase
        .from("reservas")
        // Selecciona todo de reservas (*),
        // el 'numero' de la tabla 'habitaciones' relacionada,
        // y 'nombre', 'apellido', 'dni' de la tabla 'usuarios' relacionada
        .select(`
          *,
          habitaciones ( numero ),
          usuarios ( nombre, apellido, dni )
        `)
        .lte("fecha_inicio", endStr)
        .gte("fecha_fin", startStr);
      // --- FIN DEL CAMBIO ---


      if (reservasError) throw reservasError;
      setReservas(reservasData || []);

    } catch (error) {
      console.error("Error fatal en fetchData:", error.message);
      // Podrías añadir un estado de error para mostrar un mensaje al usuario
      setRooms([]); // Limpia datos si hay error
      setReservas([]);
    } finally {
      setIsLoading(false); // Quita la carga al finalizar
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Se ejecuta al montar y cuando cambia fetchData (por las fechas)

  // --- Lógica de Estado de Celdas ---
  const getCellStatus = (roomId, date) => {
    const room = rooms.find((r) => r.id === roomId);
    // Asegúrate que tu columna se llama 'estado' y el valor es 'mantenimiento'
    if (room?.estado === "mantenimiento") return "mantenimiento";

    const dateStr = format(date, "yyyy-MM-dd");
    const reserva = reservas.find(
      (r) =>
        r.id_habitacion === roomId &&
        dateStr >= r.fecha_inicio &&
        dateStr <= r.fecha_fin &&
        blockingStates.includes(r.estado_reserva) // Comprueba si el estado bloquea
    );
    return reserva ? "ocupada" : "disponible";
  };

  // --- Handlers de Clics ---
  const handleCellClick = (roomId, date) => {
    const status = getCellStatus(roomId, date);
    if (status === "mantenimiento") return;

    const room = rooms.find((r) => r.id === roomId);
    setSelectedRoom(room);
    setSelectedDate(date); // Guardamos la fecha clickeada

    if (status === "disponible") {
      setIsNuevaReservaOpen(true); // Abrir modal NUEVA reserva
    } else {
      // Buscar la reserva específica para esta celda
      const dateStr = format(date, "yyyy-MM-dd");
      const reserva = reservas.find(
        (r) =>
          r.id_habitacion === roomId &&
          dateStr >= r.fecha_inicio &&
          dateStr <= r.fecha_fin &&
          blockingStates.includes(r.estado_reserva)
      );
      if (reserva) {
        setSelectedReserva(reserva);
        setIsDetalleReservaOpen(true); // Abrir modal DETALLE reserva
      }
    }
  };

  const handleMantenimientoClick = (room) => {
    setSelectedRoom(room);
    setIsMantenimientoOpen(true);
  };

  // Handler para cambiar estado de HABITACIÓN (disponible/mantenimiento)
  const handleStatusChange = async (newStatus) => {
    if (!selectedRoom) return;
    // Podrías añadir un estado de carga aquí también
    const { error } = await supabase
      .from("habitaciones")
      .update({ estado: newStatus })
      .eq("id", selectedRoom.id); // Asume que tu PK es 'id'
    if (error) {
      console.error("Error al actualizar habitación:", error);
      alert("Error al actualizar el estado de la habitación."); // Informa al usuario
    } else {
      await fetchData(); // Recarga los datos para ver el cambio inmediato
      setIsMantenimientoOpen(false); // Cierra el modal
      setSelectedRoom(null);
    }
  };

  // --- Funciones de Estilos ---
  const statusCellClasses = (status) => {
    switch (status) {
      case "disponible": return "bg-emerald-100 hover:bg-emerald-200 border border-emerald-300";
      case "ocupada": return "bg-rose-100 hover:bg-rose-200 border border-rose-300";
      case "mantenimiento": return "bg-slate-300 border border-slate-400 cursor-not-allowed";
      default: return "bg-gray-100 border border-gray-300"; // Añadido borde por defecto
    }
  };

  const badgeClasses = (status) => {
    // Asegúrate que los valores coincidan con tu BDD (mayúsculas/minúsculas)
    switch (status?.toLowerCase()) { // Usamos toLowerCase para ser flexibles
      case "disponible": return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-emerald-500";
      case "mantenimiento": return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-slate-500";
      default: return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-gray-500"; // Fallback gris
    }
  };

  // --- Renderizado ---
  return (
    // Contenedor principal con fondo
    <div
      className="min-h-screen " // Padding top para dejar espacio al navbar fijo
      style={{
        backgroundImage: "url('/assets/admin.png')", // Verifica esta ruta
        backgroundColor: "rgba(0,0,0,0.6)",
        backgroundBlendMode: "darken",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      {/* Contenido principal con fondo semi-transparente o sólido */}
      
      <main className="min-h-[calc(100vh-80px)] backdrop-blur-sm p-6 ">
        <div>
          <h1 className="flex text-6xl m-20 ml-10 mb-10 text-white font-serif font-medium"> 
          <LayoutGrid className="w-16 h-16 mb-4 text-gray-900 group-hover:animate-pulse pr-3" />  Mapa de ocupacion
          </h1>
          </div> {/* Ajustado min-h y añadido backdrop */}
        <section className="mx-auto max-w-[1600px]">
          {/* Leyenda */}
          <div className="   dark:bg-gray-900/80  text-white mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border border-emerald-300 bg-emerald-100 " />
              <span className="text-sm text-white">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border border-rose-300 bg-rose-100" />
              <span className="text-sm text-white">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border border-slate-400 bg-slate-300 " />
              <span className="text-sm text-white0">En Mantenimiento</span>
            </div>
          </div>

          {/* Navegación de Fechas */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="rounded border cursor-pointer bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-50/20 dark:bg-gray-900 dark:text-white"
            >
              Semana Anterior
            </button>
            <button
              onClick={() => setCurrentDate(startOfToday())}
              className="rounded border bg-white px-3  cursor-pointer py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100  dark:hover:bg-gray-50/20 dark:bg-gray-900 dark:text-white"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="rounded border cursor-pointer  bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100  dark:hover:bg-gray-50/20 dark:bg-gray-900 dark:text-white"
            >
              Semana Siguiente
            </button>
            <span className="ml-4 text-sm text-gray-800 dark:text-white">
              Mostrando: {format(startDate, "d MMM", { locale: es })} -{" "}
              {format(endDate, "d MMM yyyy", { locale: es })}
            </span>
          </div>

          {/* Grid del calendario */}
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
            <div className="min-w-[1200px] divide-y divide-gray-100"> {/* Añadido divide-y */}
              {/* Header con fechas */}
              <div
                className="grid bg-gray-900 text-white" // Color de fondo para header
                style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(80px, 1fr))` }} // Ancho mínimo celda
              >
                <div className="sticky left-0 z-10 border-r border-gray-200 bg-gray-800 p-3 text-sm font-semibold text-white"> {/* Mejorado estilo header */}
                  Habitación
                </div>
                {dates.map((date, index) => (
                  <div key={index} className="border-r border-gray-200 p-2 text-center text-xs last:border-r-0"> {/* Reducido tamaño texto */}
                    <div className="font-semibold text-white">
                      {format(date, "EEE", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
                    </div>
                    <div className="text-white">
                      {format(date, "d MMM", { locale: es })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filas */}
              {isLoading ? (
                <div className="p-10 text-center text-white">Cargando datos...</div>
              ) : rooms.length === 0 ? (
                 <div className="p-10 text-center text-white">No se encontraron habitaciones.</div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className="grid items-stretch" // Asegura que las filas tengan la misma altura
                    style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(80px, 1fr))` }}
                  >
                    {/* Columna info habitación */}
                    <div className="sticky left-0 z-[5] border-r border-gray-100 text-white bg-gray-900 p-3"> {/* Ajustado pading y z-index */}
                      <button
                        onClick={() => handleMantenimientoClick(room)}
                        className="w-full text-left text-white transition-colors hover:text-blue-600"
                        title="Gestionar estado de mantenimiento"
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2"> {/* flex-wrap */}
                          <BedIcon />
                          <span className="font-semibold">{room.numero}</span>
                          <span className={badgeClasses(room.estado)}>
                            {/* Muestra el estado capitalizado */}
                            {room.estado?.charAt(0).toUpperCase() + room.estado?.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{room.type}</div> {/* Tipo de habitación */}
                      </button>
                    </div>

                    {/* Celdas por día */}
                    {dates.map((date, i) => {
                      const status = getCellStatus(room.id, date);
                      const disabled = status === "mantenimiento";
                      return (
                        <button
                          key={i}
                          onClick={() => handleCellClick(room.id, date)}
                          disabled={disabled}
                          // Añadido border-t para líneas horizontales claras
                          className={`border-r border-gray-100 border-t p-0 text-xs transition-colors last:border-r-0 ${statusCellClasses(
                            status
                          )} ${!disabled ? "cursor-pointer" : ""}`}
                          title={`${room.numero} - ${format(date, "PPP", {
                            locale: es,
                          })} - ${status}`}
                          aria-label={`Estado habitación ${room.numero} el ${format(date, "PPP", {locale: es})}: ${status}`}
                          aria-pressed={status === "ocupada"}
                        >
                         {/* Podrías añadir contenido dentro de la celda si lo necesitas */}
                         <span className="sr-only">{status}</span> {/* Para accesibilidad */}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* --- MODALES --- */}
      {isMantenimientoOpen && selectedRoom && (
         <ModalPlaceholder
            title={`Gestionar Habitación ${selectedRoom.numero}`}
            onClose={() => setIsMantenimientoOpen(false)}
            footer={
              <button onClick={() => setIsMantenimientoOpen(false)} className="rounded border px-3 py-2 text-sm hover:bg-gray-100">
                Cancelar
              </button>
            }
         >
            <p className="text-sm text-gray-600">
              {selectedRoom.descripcion} - {selectedRoom.type}
            </p>
            <p className="mt-4 mb-2 text-sm font-medium text-gray-700">
              Cambiar estado de la habitación:
            </p>
             <div className="grid gap-2">
              <button
                onClick={() => handleStatusChange("disponible")} // Asegúrate que 'disponible' es el valor en tu BDD
                disabled={selectedRoom.estado === "disponible"}
                className="flex items-center justify-start gap-2 rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LockOpenIcon /> Marcar como Disponible
              </button>
              <button
                onClick={() => handleStatusChange("mantenimiento")} // Asegúrate que 'mantenimiento' es el valor en tu BDD
                disabled={selectedRoom.estado === "mantenimiento"}
                className="flex items-center justify-start gap-2 rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LockIcon /> Cerrar por Mantenimiento
              </button>
            </div>
         </ModalPlaceholder>
      )}

      {isNuevaReservaOpen && (
        <ModalNuevaReserva
          room={selectedRoom}
          date={selectedDate}
          onClose={() => setIsNuevaReservaOpen(false)}
          onSave={() => {
            fetchData(); // Recarga los datos del grid tras guardar
            setIsNuevaReservaOpen(false); // Cierra el modal
          }}
        />
      )}

      {isDetalleReservaOpen && (
        <ModalDetalleReserva
          reserva={selectedReserva}
          onClose={() => setIsDetalleReservaOpen(false)}
          onUpdate={() => {
            fetchData(); // Recarga los datos del grid tras actualizar
            setIsDetalleReservaOpen(false); // Cierra el modal
          }}
        />
      )}
    </div>
  );
}


// ======================================================================
// --- SUB-COMPONENTE: ModalNuevaReserva ---
// ======================================================================
function ModalNuevaReserva({ room, date, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: Buscar/Crear Cliente, 2: Confirmar Reserva
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cliente
  const [searchEmail, setSearchEmail] = useState("");
  const [cliente, setCliente] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle, loading, notFound
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");

  // Reserva
  const [fechaFin, setFechaFin] = useState("");
  const [precioCalculado, setPrecioCalculado] = useState(0);
  
  // 🔹 NUEVO ESTADO para el método de pago
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  // Calcula precio (Sin cambios)
  useEffect(() => {
    if (date && fechaFin && room?.precio) {
      try {
        const inicio = date;
        const fin = parseISO(fechaFin); 
        const noches = differenceInDays(fin, inicio);
        setPrecioCalculado(noches > 0 ? room.precio * noches : 0);
      } catch (e) { console.error("Error calculando fechas:", e); setPrecioCalculado(0); }
    } else { setPrecioCalculado(0); }
  }, [date, fechaFin, room?.precio]);

  // Busca cliente (Sin cambios)
  const handleSearch = async (e) => {
    e.preventDefault(); setIsLoading(true); setSearchStatus("loading"); setError(""); setCliente(null);
    const cleanEmail = searchEmail.trim();
    if (!cleanEmail) {
        setError("Por favor, ingrese un email.");
        setIsLoading(false);
        return;
    }
    try {
      const { data, error: dbError } = await supabase
        .from("usuarios").select("*").ilike("email", cleanEmail).eq('rol', 'cliente').single();
      if (dbError && dbError.code !== 'PGRST116') throw dbError; // Ignora "not found"
      if (data) { setCliente(data); setStep(2); }
      else { setSearchStatus("notFound"); }
    } catch (searchError) { setError("Error al buscar: " + searchError.message); setSearchStatus("idle"); }
    finally { setIsLoading(false); }
  };

  // Crea e invita cliente (Sin cambios)
  const handleCreateClient = async (e) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      const { data: inviteData, error: inviteError } = await supabase.functions.invoke('invite-user', {
          body: { email: searchEmail, nombre, apellido, dni }
      });
      if (inviteError) throw inviteError;
      if (inviteData?.error) throw new Error(inviteData.error);
      if (!inviteData?.user) throw new Error("Función no devolvió datos del usuario.");
      setCliente(inviteData.user); setStep(2);
      console.log("Invitación enviada y usuario creado:", inviteData.user);
    } catch(createError) { setError("Error al crear cliente: " + createError.message); }
    finally { setIsLoading(false); }
  };

  // 🔹 Confirma y guarda la reserva (MODIFICADO)
  const handleConfirmReserva = async (e) => {
    e.preventDefault();
    if (precioCalculado <= 0 || !fechaFin) { setError("Fecha de check-out inválida."); return; }
    if (!cliente) { setError("Cliente no identificado."); return; }
    setIsLoading(true); setError("");

    try {
      // 1. Insertar la reserva y obtener su ID
      const { data: reservaData, error: reservaError } = await supabase
        .from("reservas")
        .insert({
          id_habitacion: room.id,
          id_usuario: cliente.id,
          fecha_inicio: format(date, "yyyy-MM-dd"),
          fecha_fin: fechaFin,
          estado_reserva: "Activa",  // 🔹 Pagada y Activa de inmediato
          estado_pago: "Pagado",    // 🔹 Pagada
          precio_total: precioCalculado
        })
        .select() // 🔹 Pedimos que devuelva la fila insertada
        .single(); // 🔹 Asumimos que solo insertamos una

      if (reservaError) throw reservaError;
      if (!reservaData) throw new Error("No se pudo crear la reserva.");

      // 2. Insertar en la tabla de pagos usando el ID de la reserva
      const { error: pagoError } = await supabase
        .from("pagos")
        .insert({
          id_reserva: reservaData.id,    // 🔹 ID de la reserva recién creada
          monto: precioCalculado,
          metodo_pago: metodoPago,       // 🔹 Método de pago del selector
          fecha_pago: new Date().toISOString(),
        });

      if (pagoError) {
        // Opcional: Se podría intentar borrar la reserva si el pago falla
        console.error("El pago falló, pero la reserva se creó. ID:", reservaData.id);
        throw pagoError;
      }
      
      // 3. Si todo va bien
      onSave(); // Llama a fetchData y cierra
    } catch (saveError) { 
      setError("Error al guardar reserva: " + saveError.message); 
      setIsLoading(false); // Solo si hay error
    }
  };
return (
    <ModalPlaceholder
      title={`Reservar Habitación ${room?.numero}`}
      onClose={onClose}
      footer={<button onClick={onClose} className="button-secondary rounded-full bg-gray-100 p-1 pl-2 pr-2 cursor-pointer hover:bg-gray-200 hover:border-1 border-gray-300" disabled={isLoading}>Cancelar</button>}
    >
      {/* --- PASO 1 (Sin cambios) --- */}
      {step === 1 && (
        <div className="p-4 pb-1  bg-gray-50 rounded-lg shadow-inner ">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="label-style text-base font-semibold text-gray-800">Paso 1: Identificar Cliente</label>
            <input type="email" placeholder="Buscar por Email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="input-style ml-3 rounded-sm pl-2 border-1 border-gray-700 min-w-50 " required disabled={isLoading}/>
            <button type="submit" className="button-primary w-full mt-5 mb-5  cursor-pointer border-green-200 rounded-lg bg-green-100 hover:border-1 hover:bg-emerald-100" disabled={isLoading}>
              {isLoading && searchStatus === "loading" ? "Buscando..." : "Buscar Cliente"}
            </button>
          </form>
        </div>
      )}

      {/* --- FORMULARIO DE CREACIÓN (Sin cambios) --- */}
      {searchStatus === "notFound" && step === 1 && (
        <form onSubmit={handleCreateClient} className="mt-4 space-y-4">
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800 flex items-center">
              <svg className="inline w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" ></path></svg>
              Cliente no encontrado. Complete los datos para registrarlo.
            </p>
          </div>
          <div className="space-y-3 border-t border-gray-200 pt-4  pl-5 pr-10">
            <div><label className="label-style">Email (para invitación)</label><input type="email" value={searchEmail} disabled className="input-style-disabled  mt-1 ml-2 w-50 font-medium"/></div>
            <div><label className="label-style">Nombre</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="input-style rounded-lg mt-1 ml-2 border-black border-1 pl-2" required disabled={isLoading}/></div>
            <div><label className="label-style">Apellido</label><input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="input-style mt-1 ml-2 border-black border-1 pl-2 rounded-lg" required disabled={isLoading}/></div>
            <div><label className="label-style">DNI</label><input type="text" value={dni} onChange={e => setDni(e.target.value)} className="input-style mt-1 ml-10 border-black border-1 pl-2 rounded-lg " required disabled={isLoading}/></div>
    
            <button type="submit" className="button-success w-full max-w-50  bg-green-100 cursor-pointer rounded-lg mt-3 hover:shadow-2xl- hover:border-1 border-green-200" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear e Invitar Cliente"}
            </button>
          </div>
        </form>
      )}

      {/* --- PASO 2 (MODIFICADO) --- */}
      {step === 2 && cliente && (
        <form onSubmit={handleConfirmReserva} className="space-y-3 ml-5 mr-5">
          <div className="rounded bg-green-100 p-2 text-sm text-green-800">Cliente: {cliente.nombre} {cliente.apellido} (DNI: {cliente.dni})</div>
          <p className="text-sm font-medium text-gray-800 pl-1">Habitación: {room?.numero} ({room?.type})</p>
          <p className="text-sm font-medium text-gray-800 pl-1">Check-in: {format(date, "PPP", { locale: es })}</p>
          <div>
            <label className="label-style mr-2 pl-1">Fecha de salida</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} min={format(addDays(date, 1), 'yyyy-MM-dd')} className="input-style mt-1 cursor-pointer bg-gray-100 rounded-xl pl-2 pr-2" required disabled={isLoading}/>
          </div>
          
          {/*   MÉTODO DE PAGO  */}
          <div>
            <label htmlFor="metodoPago" className="label-style pl-1">Método de Pago</label>
            <select
              id="metodoPago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="input-style mt-1 bg-gray-100 rounded-full p-1 cursor-pointer ml-3" // Reutiliza la clase de estilo
              disabled={isLoading}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Visa">Tarjeta Visa</option>
              <option value="Mastercard">Tarjeta Mastercard</option>
              <option value="American Express">American Express</option>
              <option value="Naranja">Tarjeta Naranja</option>
              <option value="Transferencia">Transferencia Bancaria</option>
            </select>
          </div>
          
          {precioCalculado > 0 && <p className="text-lg font-semibold text-black text-center mt-5">Precio Total: ${precioCalculado}</p>}
          
          <button type="submit" className="button-primary w-full mt-5 pt-1 pb-1  cursor-pointer rounded-md text-white bg-red-500 hover:bg-red-800" disabled={isLoading || precioCalculado <= 0}>
            {isLoading ? "Guardando..." : "Confirmar Reserva y Pago"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

      {/* --- ESTILOS (Sin cambios) --- */}
      <style jsx>{`
        .input-style { 
          @apply block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm 
          transition-colors duration-150; 
        }
        .input-style-disabled { 
          @apply block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm cursor-not-allowed; 
        }
        .label-style { 
          @apply block text-sm font-medium text-gray-700; 
        }
        .button-primary { 
          @apply rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm 
          hover:bg-indigo-700 disabled:opacity-50
          transition-colors duration-150; 
        }
        .button-success { 
          @apply rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm 
          hover:bg-green-600 disabled:opacity-50
          transition-colors duration-150; 
        }
        .button-danger { 
          @apply rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm 
          hover:bg-red-600 disabled:opacity-50
          transition-colors duration-150; 
        }
        .button-secondary { 
          @apply rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm 
          hover:bg-gray-50 disabled:opacity-50
          transition-colors duration-150; 
        }
      `}</style>
    </ModalPlaceholder>
  );
}