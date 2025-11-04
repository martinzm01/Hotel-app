// ----------------------------------------------------------------------
// Archivo: MapaOcupacion.jsx
// ----------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../back_supabase/client"; // Ajusta la ruta
import ModalPlaceholder from "../components/ModalPlaceholder"; // Ajusta la ruta
import ModalDetalleReserva from "../components/ModalDetalleReserva"; // Ajusta la ruta
import Hotelheader from "../components/headerHabitaciones"; // Ajusta la ruta
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

// --- NUEVO: Importa el modal externo ---
import ModalNuevaReserva from "../components/ModalNuevaReserva"; // Ajusta esta ruta

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

// Defino los estados que cuentan como "Ocupada"
const blockingStates = ["Pendiente", "Confirmada", "Activa"];

// --- Componente Principal ---
export default function MapaOcupacion() {
  // --- Estados ---
  const [rooms, setRooms] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
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

      // Traemos reservas con datos de habitación y usuario
      const { data: reservasData, error: reservasError } = await supabase
        .from("reservas")
        .select(`
          *,
          habitaciones ( numero ),
          usuarios ( nombre, apellido, dni )
        `)
        .lte("fecha_inicio", endStr)
        .gte("fecha_fin", startStr);

      if (reservasError) throw reservasError;
      setReservas(reservasData || []);

    } catch (error) {
      console.error("Error fatal en fetchData:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica de Estado de Celdas ---
  const getCellStatus = (roomId, date) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room?.estado === "mantenimiento") return "mantenimiento";

    const dateStr = format(date, "yyyy-MM-dd");
    const reserva = reservas.find(
      (r) =>
        r.id_habitacion === roomId &&
        dateStr >= r.fecha_inicio &&
        dateStr < r.fecha_fin &&
        blockingStates.includes(r.estado_reserva)
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
      setIsNuevaReservaOpen(true); // Abrir modal NUEVA reserva
    } else {
      // Buscar la reserva específica para esta celda
      const dateStr = format(date, "yyyy-MM-dd");
      const reserva = reservas.find(
        (r) =>
          r.id_habitacion === roomId &&
          dateStr >= r.fecha_inicio &&
          dateStr < r.fecha_fin &&
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

  // Handler para cambiar estado de HABITACIÓN
  const handleStatusChange = async (newStatus) => {
    if (!selectedRoom) return;
    const { error } = await supabase
      .from("habitaciones")
      .update({ estado: newStatus })
      .eq("id", selectedRoom.id);
    if (error) {
      console.error("Error al actualizar habitación:", error);
      alert("Error al actualizar el estado de la habitación.");
    } else {
      await fetchData(); 
      setIsMantenimientoOpen(false);
      setSelectedRoom(null);
    }
  };

  // --- Funciones de Estilos ---
  const statusCellClasses = (status) => {
    switch (status) {
      case "disponible": return "bg-emerald-100 hover:bg-emerald-200 border border-emerald-300";
      case "ocupada": return "bg-rose-100 hover:bg-rose-200 border border-rose-300";
      case "mantenimiento": return "bg-slate-300 border border-slate-400 cursor-not-allowed";
      default: return "bg-gray-100 border border-gray-300";
    }
  };

  const badgeClasses = (status) => {
    switch (status?.toLowerCase()) { 
      case "disponible": return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-emerald-500";
      case "mantenimiento": return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-slate-500";
      default: return "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white bg-gray-500";
    }
  };

  // --- Renderizado ---
  return (
    <div
      className="min-h-screen "
      style={{
        backgroundImage: "url('/assets/admin.png')",
        backgroundColor: "rgba(0,0,0,0.6)",
        backgroundBlendMode: "darken",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <main className="min-h-[calc(100vh-80px)] backdrop-blur-sm p-6 ">
        <div>
          <h1 className="flex text-6xl m-20 ml-10 mb-10 text-white font-serif font-medium"> 
            <LayoutGrid className="w-16 h-16 mb-4 text-gray-900 group-hover:animate-pulse pr-3" />  Mapa de ocupacion
          </h1>
        </div>
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
            <div className="min-w-[1200px] divide-y divide-gray-100">
              {/* Header con fechas */}
              <div
                className="grid bg-gray-900 text-white" 
                style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(80px, 1fr))` }}
              >
                <div className="sticky left-0 z-10 border-r border-gray-200 bg-gray-800 p-3 text-sm font-semibold text-white">
                  Habitación
                </div>
                {dates.map((date, index) => (
                  <div key={index} className="border-r border-gray-200 p-2 text-center text-xs last:border-r-0">
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
                    className="grid items-stretch"
                    style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(80px, 1fr))` }}
                  >
                    {/* Columna info habitación */}
                    <div className="sticky left-0 z-[5] border-r border-gray-100 text-white bg-gray-900 p-3">
                      <button
                        onClick={() => handleMantenimientoClick(room)}
                        className="w-full text-left text-white transition-colors hover:text-blue-600"
                        title="Gestionar estado de mantenimiento"
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <BedIcon />
                          <span className="font-semibold">{room.numero}</span>
                          <span className={badgeClasses(room.estado)}>
                            {room.estado?.charAt(0).toUpperCase() + room.estado?.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{room.type}</div>
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
                          className={`border-r border-gray-100 border-t p-0 text-xs transition-colors last:border-r-0 ${statusCellClasses(
                            status
                          )} ${!disabled ? "cursor-pointer" : ""}`}
                          title={`${room.numero} - ${format(date, "PPP", {
                            locale: es,
                          })} - ${status}`}
                          aria-label={`Estado habitación ${room.numero} el ${format(date, "PPP", {locale: es})}: ${status}`}
                          aria-pressed={status === "ocupada"}
                        >
                          <span className="sr-only">{status}</span>
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
               <button onClick={() => setIsMantenimientoOpen(false)} className="rounded border px-3 py-2 text-sm hover:bg-gray-200">
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
                onClick={() => handleStatusChange("disponible")}
                disabled={selectedRoom.estado === "disponible"}
                className="flex items-center justify-start gap-2 rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LockOpenIcon /> Marcar como Disponible
              </button>
              <button
                onClick={() => handleStatusChange("mantenimiento")}
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

