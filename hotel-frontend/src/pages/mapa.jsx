// ----------------------------------------------------------------------
// Archivo: MapaOcupacion.jsx
// ----------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../back_supabase/client"; // Ajusta la ruta a tu cliente Supabase
import ModalPlaceholder from "../components/ModalPlaceholder"; // Ajusta la ruta a tu componente Modal
import ModalDetalleReserva from "../components/ModalDetalleReserva"
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
      className="min-h-screen pt-20" // Padding top para dejar espacio al navbar fijo
      style={{
        backgroundImage: "url('/assets/piscina del hotel.png')", // Verifica esta ruta
        backgroundColor: "rgba(0,0,0,0.8)",
        backgroundBlendMode: "darken",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      {/* Contenido principal con fondo semi-transparente o sólido */}
      <main className="min-h-[calc(100vh-80px)] bg-gray-50/95 p-6 backdrop-blur-sm"> {/* Ajustado min-h y añadido backdrop */}
        <section className="mx-auto max-w-[1600px]">
          {/* Título */}
          <div className="mb-8">
            <h1 className="mb-2 font-serif text-5xl md:text-6xl font-light text-black">
              Mapa de Ocupación
            </h1>
            <p className="text-gray-700">
              Visualiza y gestiona el estado de todas las habitaciones en tiempo real
            </p>
          </div>

          {/* Leyenda */}
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border border-emerald-300 bg-emerald-100" />
              <span className="text-sm text-gray-700">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border border-rose-300 bg-rose-100" />
              <span className="text-sm text-gray-700">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border border-slate-400 bg-slate-300" />
              <span className="text-sm text-gray-700">En Mantenimiento</span>
            </div>
          </div>

          {/* Navegación de Fechas */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="rounded border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
            >
              Semana Anterior
            </button>
            <button
              onClick={() => setCurrentDate(startOfToday())}
              className="rounded border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="rounded border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
            >
              Semana Siguiente
            </button>
            <span className="ml-4 text-sm text-gray-800">
              Mostrando: {format(startDate, "d MMM", { locale: es })} -{" "}
              {format(endDate, "d MMM yyyy", { locale: es })}
            </span>
          </div>

          {/* Grid del calendario */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="min-w-[1200px] divide-y divide-gray-100"> {/* Añadido divide-y */}
              {/* Header con fechas */}
              <div
                className="grid bg-gray-50" // Color de fondo para header
                style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(80px, 1fr))` }} // Ancho mínimo celda
              >
                <div className="sticky left-0 z-10 border-r border-gray-200 bg-gray-100 p-3 text-sm font-semibold text-gray-800"> {/* Mejorado estilo header */}
                  Habitación
                </div>
                {dates.map((date, index) => (
                  <div key={index} className="border-r border-gray-200 p-2 text-center text-xs last:border-r-0"> {/* Reducido tamaño texto */}
                    <div className="font-semibold text-gray-700">
                      {format(date, "EEE", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
                    </div>
                    <div className="text-gray-500">
                      {format(date, "d MMM", { locale: es })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filas */}
              {isLoading ? (
                <div className="p-10 text-center text-gray-500">Cargando datos...</div>
              ) : rooms.length === 0 ? (
                 <div className="p-10 text-center text-gray-500">No se encontraron habitaciones.</div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className="grid items-stretch" // Asegura que las filas tengan la misma altura
                    style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(80px, 1fr))` }}
                  >
                    {/* Columna info habitación */}
                    <div className="sticky left-0 z-[5] border-r border-gray-100 bg-white p-3"> {/* Ajustado pading y z-index */}
                      <button
                        onClick={() => handleMantenimientoClick(room)}
                        className="w-full text-left text-gray-800 transition-colors hover:text-blue-600"
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
// (Mueve esto a src/components/ModalNuevaReserva.jsx si prefieres)
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

  // Calcula precio
  useEffect(() => {
    if (date && fechaFin && room?.precio) {
      try {
        const inicio = date;
        const fin = parseISO(fechaFin); // El input da string, parseamos a Date
        // differenceInDays calcula noches. Si check-in=10, check-out=12 -> 2 noches.
        const noches = differenceInDays(fin, inicio);
        setPrecioCalculado(noches > 0 ? room.precio * noches : 0);
      } catch (e) { console.error("Error calculando fechas:", e); setPrecioCalculado(0); }
    } else { setPrecioCalculado(0); }
  }, [date, fechaFin, room?.precio]);

  // Busca cliente
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

  // Crea e invita cliente (llama a Edge Function)
  const handleCreateClient = async (e) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      // LLAMA A TU EDGE FUNCTION 'invite-user'
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

  // Confirma y guarda la reserva
  const handleConfirmReserva = async (e) => {
    e.preventDefault();
    if (precioCalculado <= 0 || !fechaFin) { setError("Fecha de check-out inválida."); return; }
    if (!cliente) { setError("Cliente no identificado."); return; }
    setIsLoading(true); setError("");
    try {
      const { error: insertError } = await supabase.from("reservas").insert({
        id_habitacion: room.id, id_usuario: cliente.id,
        fecha_inicio: format(date, "yyyy-MM-dd"), fecha_fin: fechaFin,
        estado_reserva: "Activa", estado_pago: "Pendiente", // Ajusta estados si es necesario
        precio_total: precioCalculado
      });
      if (insertError) throw insertError;
      onSave(); // Llama a fetchData y cierra
    } catch (saveError) { setError("Error al guardar reserva: " + saveError.message); setIsLoading(false); }
    // No setIsLoading(false) si onSave cierra el modal
  };

  return (
    <ModalPlaceholder
      title={`Reservar Habitación ${room?.numero}`}
      onClose={onClose}
      footer={<button onClick={onClose} className="button-secondary" disabled={isLoading}>Cancelar</button>} // Usando clase CSS
    >
      {/* --- PASO 1 --- */}
      {step === 1 && (
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="label-style">Paso 1: Identificar Cliente</label>
          <input type="email" placeholder="Buscar por Email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="input-style" required disabled={isLoading}/>
          <button type="submit" className="button-primary w-full" disabled={isLoading}>
            {isLoading && searchStatus === "loading" ? "Buscando..." : "Buscar Cliente"}
          </button>
        </form>
      )}
      {searchStatus === "notFound" && step === 1 && (
        <form onSubmit={handleCreateClient} className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <p className="text-center text-sm text-red-600">Cliente no encontrado. Registrar nuevo cliente.</p>
          <div><label className="label-style">Email (invitación)</label><input type="email" value={searchEmail} disabled className="input-style-disabled mt-1"/></div>
          <div><label className="label-style">Nombre</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="input-style mt-1" required disabled={isLoading}/></div>
          <div><label className="label-style">Apellido</label><input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="input-style mt-1" required disabled={isLoading}/></div>
          <div><label className="label-style">DNI</label><input type="text" value={dni} onChange={e => setDni(e.target.value)} className="input-style mt-1" required disabled={isLoading}/></div>
          <button type="submit" className="button-success w-full" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear e Invitar Cliente"}
          </button>
        </form>
      )}

      {/* --- PASO 2 --- */}
      {step === 2 && cliente && (
        <form onSubmit={handleConfirmReserva} className="space-y-3">
          <div className="rounded bg-green-100 p-2 text-sm text-green-800">Cliente: {cliente.nombre} {cliente.apellido} (DNI: {cliente.dni})</div>
          <p className="text-sm font-medium text-gray-800">Habitación: {room?.numero} ({room?.type})</p>
          <p className="text-sm font-medium text-gray-800">Check-in: {format(date, "PPP", { locale: es })}</p>
          <div>
            <label className="label-style">Fecha de Check-out</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} min={format(addDays(date, 1), 'yyyy-MM-dd')} className="input-style mt-1" required disabled={isLoading}/>
          </div>
          {precioCalculado > 0 && <p className="text-sm font-semibold text-gray-900">Precio Total: ${precioCalculado}</p>}
          <button type="submit" className="button-primary w-full" disabled={isLoading || precioCalculado <= 0}>
            {isLoading ? "Guardando..." : "Confirmar Reserva"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

      {/* Estilos rápidos (mueve a CSS global o config de Tailwind) */}
      <style jsx>{`
        .input-style { @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm; }
        .input-style-disabled { @apply block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm cursor-not-allowed; }
        .label-style { @apply block text-sm font-medium text-gray-700; }
        .button-primary { @apply rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50; }
        .button-success { @apply rounded bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50; }
        .button-danger { @apply rounded bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50; }
        .button-secondary { @apply rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50; }
      `}</style>
    </ModalPlaceholder>
  );
}

