import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../back_supabase/client"; // Asegúrate que la ruta es correcta
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./ui/table/index"; // Asumiendo estructura shadcn/ui o similar
import Badge from "./ui/badge/Badge"; // Asumiendo estructura shadcn/ui o similar
// Importa el modal de detalle que creamos
import ModalDetalleReserva from "./ModalDetalleReserva"; // Asegúrate que la ruta es correcta
import { format, parseISO } from "date-fns"; // Para formatear fechas si es necesario
import { es } from "date-fns/locale";

// --- Helper para dar color a los Badges (Ajusta colores si quieres) ---
const getStatusBadgeClass = (status) => {
  // Usa toLowerCase para ser flexible con mayúsculas/minúsculas
  const lowerStatus = status?.toLowerCase() || '';
  switch (lowerStatus) {
    case "pendiente": return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "confirmada": return "bg-blue-100 text-blue-800 border border-blue-300";
    case "activa": return "bg-indigo-100 text-indigo-800 border border-indigo-300";
    case "finalizada": return "bg-green-100 text-green-800 border border-green-300";
    case "cancelada": return "bg-red-100 text-red-800 border border-red-300";
    case "pagado": return "bg-green-100 text-green-800 border border-green-300";
    case "reembolsado": return "bg-gray-100 text-gray-800 border border-gray-300";
    default: return "bg-gray-100 text-gray-800 border border-gray-300";
  }
};

export default function TableAdminReservas() {
  const [filterDni, setFilterDni] = useState("");
  const [filterHabitacion, setFilterHabitacion] = useState("");
  // --- Estados para datos de Supabase ---
  const [reservas, setReservas] = useState([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados del Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // --- Función para cargar datos ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Limpia errores previos
    try {
      // Traemos reservas, y datos relacionados de usuarios y habitaciones
      const { data, error: dbError } = await supabase
        .from("reservas")
        .select(`
          *,
          habitaciones ( numero ),
          usuarios ( nombre, apellido, dni )
        `)
        // Opcional: Ordenar por fecha de creación o inicio
        .order('creada', { ascending: false });

      if (dbError) throw dbError;

      console.log("Datos recibidos de Supabase:", data); // Para depuración
      setReservas(data || []);

    } catch (fetchError) {
      console.error("Error fetching reservas:", fetchError);
      setError("No se pudieron cargar las reservas.");
      setReservas([]); // Limpia datos en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencias vacías para cargar solo una vez (o añade filtros si paginas)

  // --- Carga inicial de datos ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Filtrado (adaptado a datos reales) ---
  const filteredData = reservas.filter((reserva) => {
    // Comprobaciones más seguras por si los datos anidados no vienen
    const clienteDni = reserva.usuarios?.dni?.toLowerCase() || '';
    const habitacionNum = reserva.habitaciones?.numero?.toString() || reserva.id_habitacion?.toString() || ''; // Usa ID si no hay número
    const filterDniLower = filterDni.toLowerCase();
    const filterHabitacionLower = filterHabitacion.toLowerCase();

    return (
      clienteDni.includes(filterDniLower) &&
      habitacionNum.includes(filterHabitacionLower)
    );
  });

  // --- Acciones (Ahora solo abren el modal) ---
  const handleGestionarClick = (reserva) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReserva(null);
  };

  // --- Renderizado ---
  return (
    <div className="flex flex-col items-center p-4">
      {/* Filtros */}
      <div className="mb-4 flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por DNI..."
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterDni}
          onChange={(e) => setFilterDni(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por Habitación..."
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterHabitacion}
          onChange={(e) => setFilterHabitacion(e.target.value)}
        />
      </div>

      {/* Indicador de Carga o Error */}
      {isLoading && <p className="my-4 text-gray-600">Cargando reservas...</p>}
      {error && <p className="my-4 text-red-600">{error}</p>}

      {/* Tabla */}
      {!isLoading && !error && (
        <div className="w-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-700">
                <TableRow>
                  {/* Simplificado nombres de columnas */}
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cliente</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Hab.</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fechas</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Precio</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Est. Reserva</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Est. Pago</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-4 text-center text-gray-500">
                      No se encontraron reservas con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((reserva) => (
                    // Asegúrate que tu PK se llama 'id' y no 'id_reserva'
                    <TableRow key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-400 hover:text-white">
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-900 dark:text-black">{reserva.id}</TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        {/* Muestra datos del cliente si existen */}
                        {reserva.usuarios ? (
                          <div>
                            <span className="block text-sm font-medium text-gray-900 dark:text-black">
                              {reserva.usuarios.nombre} {reserva.usuarios.apellido}
                            </span>
                            <span className="block text-xs text-gray-100 dark:text-black ">
                              DNI: {reserva.usuarios.dni}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">ID: {reserva.id_usuario}</span>
                        )}
                      </TableCell>

                      {/* Muestra número de habitación si existe, si no, el ID */}
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-900 dark:text-black">
                        {reserva.habitaciones?.numero || reserva.id_habitacion}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                          <div className="text-sm text-gray-900 dark:text-black">
                          {/* Formatea las fechas */}
                          <span className="block">In: {format(parseISO(reserva.fecha_inicio), "dd/MM/yy")}</span>
                          <span className="block">Out: {format(parseISO(reserva.fecha_fin), "dd/MM/yy")}</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start text-sm text-gray-900 dark:text-black">${reserva.precio_total}</TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <Badge className={`${getStatusBadgeClass(reserva.estado_reserva)} px-2 py-1 text-xs`}>
                          {reserva.estado_reserva}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                         {/* Muestra 'Pendiente' si estado_pago es null */}
                        <Badge className={`${getStatusBadgeClass(reserva.estado_pago || 'Pendiente')} px-2 py-1 text-xs`}>
                          {reserva.estado_pago || 'Pendiente'}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <button
                          className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-blue-600"
                          onClick={() => handleGestionarClick(reserva)}
                        >
                          Gestionar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* --- MODAL DE GESTIÓN (Importado) --- */}
      {isModalOpen && selectedReserva && (
        <ModalDetalleReserva
          reserva={selectedReserva}
          onClose={closeModal}
          // Pasamos fetchData para que el modal pueda recargar la tabla
          onUpdate={() => {
            fetchData(); // Vuelve a cargar los datos de la tabla
            closeModal(); // Cierra el modal
          }}
        />
      )}
    </div>
  );
}
