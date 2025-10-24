// ----------------------------------------------------------------------
// Archivo: MapaOcupacion.jsx
// ----------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from "react"; // <-- 1. IMPORTAMOS useMemo
import { supabase } from "../back_supabase/Client";
import ModalPlaceholder from "../components/ModalPlaceholder";
// Importamos las funciones de date-fns
import {
  format,
  addDays,
  eachDayOfInterval,
  parseISO,
  startOfToday,
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

// Defino los estados que cuentan como "Ocupada" (Sensible a mayúsculas)
const blockingStates = ["Pendiente", "Confirmada", "Activa"];

// --- Componente Principal ---
export default function MapaOcupacion() {
  // --- Estados ---
  const [rooms, setRooms] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [isLoading, setIsLoading] = useState(false);
  const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false);
  const [isNuevaReservaOpen, setIsNuevaReservaOpen] = useState(false);
  const [isDetalleReservaOpen, setIsDetalleReservaOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // --- Generación de Fechas (CORREGIDO CON useMemo) ---
  const daysToShow = 14;

  // 2. Memoriza startDate. Solo se recalcula si 'currentDate' cambia.
  const startDate = useMemo(() => new Date(currentDate), [currentDate]);

  // 3. Memoriza endDate. Solo se recalcula si 'startDate' cambia.
  const endDate = useMemo(() => addDays(startDate, daysToShow - 1), [
    startDate,
  ]);

  // 4. Memoriza el array 'dates'. Solo se recalcula si las fechas cambian.
  const dates = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  // --- Carga de Datos (Efecto Principal) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      // 1. Obtener Habitaciones
      const { data: habitacionesData, error: habitacionesError } = await supabase
        .from("habitaciones")
        .select("*")
        .order("numero", { ascending: true }); // Usamos 'numero'

      if (habitacionesError) {
        throw new Error(`Error al leer habitaciones: ${habitacionesError.message}`);
      }
      
      setRooms(habitacionesData || []);

      // 2. Obtener Reservas
      const { data: reservasData, error: reservasError } = await supabase
        .from("reservas")
        .select("*")
        .lte("fecha_inicio", endStr)
        .gte("fecha_fin", startStr);

      if (reservasError) {
        throw new Error(`Error al leer reservas: ${reservasError.message}`);
      }
      
      setReservas(reservasData || []);

    } catch (error) {
      console.error("Error fatal en fetchData:", error.message);
    } finally {
      // Se ejecuta siempre, incluso si hay un error
      setIsLoading(false);
    }
  }, [startDate, endDate]); // Dependencia estable gracias a useMemo

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependencia estable gracias a useCallback

  // --- Lógica de Estado de Celdas ---
  const getCellStatus = (roomId, date) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room?.estado === "mantenimiento") {
      return "mantenimiento";
    }

    const dateStr = format(date, "yyyy-MM-dd");
    const reserva = reservas.find(
      (r) =>
        r.id_habitacion === roomId &&
        dateStr >= r.fecha_inicio &&
        dateStr <= r.fecha_fin &&
        blockingStates.includes(r.estado_reserva) // Lógica de 'blockingStates'
    );

    return reserva ? "ocupada" : "disponible";
  };

  // --- Handlers de Clics ---
  const handleCellClick = (roomId, date) => {
    const status = getCellStatus(roomId, date);
    if (status === "mantenimiento") return;

    const room = rooms.find((r) => r.id === roomId);
    setSelectedRoom(room);
    setSelectedDate(date);

    if (status === "disponible") {
      setIsNuevaReservaOpen(true);
    } else {
      const dateStr = format(date, "yyyy-MM-dd");
      const reserva = reservas.find(
        (r) =>
          r.id_habitacion === roomId &&
          dateStr >= r.fecha_inicio &&
          dateStr <= r.fecha_fin &&
          blockingStates.includes(r.estado_reserva) // Lógica de 'blockingStates'
      );

      if (reserva) {
        setSelectedReserva(reserva);
        setIsDetalleReservaOpen(true);
      }
    }
  };

  const handleMantenimientoClick = (room) => {
    setSelectedRoom(room);
    setIsMantenimientoOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedRoom) return;

    const { error } = await supabase
      .from("habitaciones")
      .update({ estado: newStatus })
      .eq("id", selectedRoom.id);

    if (error) {
      console.error("Error al actualizar habitación:", error);
    } else {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoom.id ? { ...r, estado: newStatus } : r
        )
      );
      setIsMantenimientoOpen(false);
      setSelectedRoom(null);
    }
  };

  // --- Funciones de Estilos ---
  const statusCellClasses = (status) => {
    switch (status) {
      case "disponible":
        return "bg-emerald-100 hover:bg-emerald-200 border-emerald-300";
      case "ocupada":
        return "bg-rose-100 hover:bg-rose-200 border-rose-300";
      case "mantenimiento":
        return "bg-slate-300 border-slate-400 cursor-not-allowed";
      default:
        return "bg-gray-100";
    }
  };

  const badgeClasses = (status) => {
    switch (status) {
      case "disponible":
        return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-emerald-500";
      case "mantenimiento":
        return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-slate-500";
      default:
        return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-gray-500";
    }
  };

  // --- Renderizado ---
  return (
    <div className="pt-20"
    style={{
      backgroundImage: "url('/assets/piscina del hotel.png')",
      backgroundColor: "rgba(0,0,0,0.8)",
      backgroundBlendMode:"darken",

    }} >
    <main className=" min-h-screen  bg-background p-6 bg-gray-50 " 
    style={{
    }}>
      <section className="mg-gray-50 mx-auto max-w-[1600px] ">
        {/* Título */}
        <div className="mb-8">
          <h1 className="mb-2 text-black font-serif text-6xl font-light text-foreground ">
            Mapa de Ocupación
          </h1>
          <p className="text-muted-foreground text-black">
            Visualiza y gestiona el estado de todas las habitaciones en tiempo real
          </p>
        </div>

        {/* Leyenda */}
        <div className="bg-gray-50 mb-6 flex flex-wrap gap-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-8 rounded border border-emerald-300 bg-emerald-100" />
            <span className="text-sm text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-8 rounded border border-rose-300 bg-rose-100" />
            <span className="text-sm text-muted-foreground">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-8 rounded border border-slate-400 bg-slate-300" />
            <span className="text-sm text-muted-foreground">En Mantenimiento</span>
          </div>
        </div>

        {/* Navegación de Fechas */}
        <div className=" mb-4 flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="bg-gray-50 rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Semana Anterior
          </button>
          <button
            onClick={() => setCurrentDate(startOfToday())}
            className=" bg-gray-50 rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="bg-gray-50 rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Semana Siguiente
          </button>
          <span className="text-black text-sm text-muted-foreground ml-4">
            Mostrando: {format(startDate, "d MMM", { locale: es })} -{" "}
            {format(endDate, "d MMM yyyy", { locale: es })}
          </span>
        </div>

        {/* Grid del calendario */}
        <div className="bg-gray-50 overflow-x-auto rounded-lg border bg-card shadow-sm">
          <div className="min-w-[1200px]">
            {/* Header con fechas */}
            <div
              className="grid border-b bg-muted/50"
              style={{
                gridTemplateColumns: `200px repeat(${daysToShow}, 1fr)`,
              }}
            >
              <div className="sticky left-0 z-10 border-r bg-muted/50 p-4 font-semibold">
                Habitación
              </div>
              {dates.map((date, index) => (
                <div key={index} className="border-r p-2 text-center text-sm last:border-r-0">
                  <div className="font-semibold">
                    {format(date, "EEE", { locale: es }).replace(/^\w/, (c) =>
                      c.toUpperCase()
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {format(date, "d MMM", { locale: es })}
                  </div>
                </div>
              ))}
            </div>

            {/* Filas */}
            {isLoading ? (
              <div className="p-4 text-center">Cargando datos...</div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="grid border-b last:border-b-0"
                  style={{
                    gridTemplateColumns: `200px repeat(${daysToShow}, 1fr)`,
                  }}
                >
                  {/* Columna info habitación */}
                  <div className="sticky left-0 z-10 border-r bg-white p-4">
                    <button
                      onClick={() => handleMantenimientoClick(room)}
                      className="w-full text-left transition-colors hover:text-primary"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <BedIcon />
                        <span className="font-semibold">{room.numero}</span>
                        <span className={badgeClasses(room.estado)}>
                          {room.estado === "disponible" && "Disponible"}
                          {room.estado === "mantenimiento" && "Mantenimiento"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {room.type}
                      </div>
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
                        className={`border-r p-2 transition-colors last:border-r-0 ${statusCellClasses(
                          status
                        )} ${!disabled ? "cursor-pointer" : ""}`}
                        title={`${room.numero} - ${format(date, "PPP", {
                          locale: es,
                        })} - ${status}`}
                        aria-pressed={status === "ocupada"}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- MODALES --- */}

      {/* Modal Mantenimiento */}
      {isMantenimientoOpen && selectedRoom && (
        <ModalPlaceholder
          title={`Gestionar Habitación ${selectedRoom.numero}`}
          onClose={() => setIsMantenimientoOpen(false)}
        >
          <p className="text-sm text-muted-foreground">
            {selectedRoom.descripcion} - {selectedRoom.type}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Cambiar estado de la habitación:
          </p>
          <div className="grid gap-2">
            <button
              onClick={() => handleStatusChange("disponible")}
              disabled={selectedRoom.estado === "disponible"}
              className="flex items-center justify-start gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <LockOpenIcon />
              Marcar como Disponible
            </button>
            <button
              onClick={() => handleStatusChange("mantenimiento")}
              disabled={selectedRoom.estado === "mantenimiento"}
              className="flex items-center justify-start gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <LockIcon />
              Cerrar por Mantenimiento
            </button>
          </div>
        </ModalPlaceholder>
      )}

      {/* --- Placeholder: Modal Nueva Reserva --- */}
      {isNuevaReservaOpen && (
        <ModalPlaceholder
          title="Crear Nueva Reserva"
          onClose={() => setIsNuevaReservaOpen(false)}
        >
          <p>Habitación: {selectedRoom?.numero}</p>
          <p>Fecha Check-in: {format(selectedDate, "PPP", { locale: es })}</p>
          <p>Aquí iría el formulario para buscar cliente y crear la reserva...</p>
        </ModalPlaceholder>
      )}

      {/* --- Placeholder: Modal Detalle Reserva --- */}
      {isDetalleReservaOpen && (
        <ModalPlaceholder
          title="Detalle de la Reserva"
          onClose={() => setIsDetalleReservaOpen(false)}
        >
          <p>Habitación: {selectedRoom?.numero}</p>
          <p>Cliente ID: {selectedReserva?.id_usuario}</p>
          <p>
            Check-in:{" "}
            {format(parseISO(selectedReserva?.fecha_inicio), "PPP", { locale: es })}
          </p>
          <p>
            Check-out:{" "}
            {format(parseISO(selectedReserva?.fecha_fin), "PPP", { locale: es })}
          </p>
          <p>Estado: {selectedReserva?.estado_reserva}</p>
          <p>Precio: ${selectedReserva?.precio_total}</p>
          <p>Aquí irían los botones "Cancelar Reserva", "Registrar Pago", etc.</p>
        </ModalPlaceholder>
      )}
    </main>
    </div>
  );
}