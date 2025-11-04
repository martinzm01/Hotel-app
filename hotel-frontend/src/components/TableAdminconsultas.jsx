import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../back_supabase/client"; // Asegúrate que la ruta es correcta
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "./ui/table/index";
import Badge from "./ui/badge/Badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

// --- Helper para dar color a los Badges de Estado de Consulta ---
const getStatusBadgeClass = (status) => {
  // El status ahora es un booleano (respondida)
    if (status) {
        // true = Respondida
        return "bg-green-100 text-green-800 border border-green-300";
    } else {
        // false = Pendiente
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    }
};

// --- Icono de Cierre (X) ---
const CloseIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Componente del Modal ---
function ModalDetalleConsulta({ consulta, onClose, onUpdate }) {
    // Estado local para la respuesta del operador
    const [respuesta, setRespuesta] = useState(consulta.respuesta || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Obtenemos el ID del operador logueado al cargar el modal
    useEffect(() => {
        const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error fetching current user:", error);
            setError("No se pudo identificar al operador. Recargue la página.");
        } else if (user) {
            setCurrentUserId(user.id);
        }
        };
        fetchUser();
    }, []);

    // Manejador para guardar la respuesta
    const handleSubmitRespuesta = async (e) => {
        e.preventDefault();
        
        if (!currentUserId) {
            setError("Error de autenticación. No se puede guardar la respuesta.");
            return;
        }

        if (respuesta.trim() === '') {
            setError("La respuesta no puede estar vacía.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
        const { error: updateError } = await supabase
            .from('consultas')
            .update({
            respuesta: respuesta, // El texto de la respuesta
            respondida: true,     // Marcar como respondida
            respondida_por: currentUserId // El ID del operador que está respondiendo
            })
            .eq('id', consulta.id); // Dónde el ID coincida

        if (updateError) throw updateError;

        // Si todo fue bien, llamamos a onUpdate para refrescar la tabla
        onUpdate();

        } catch (error) {
        console.error("Error updating consulta:", error);
        setError("No se pudo guardar la respuesta. Inténtelo de nuevo.");
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        // Fondo oscuro semi-transparente
        <div 
        className=" z-50 flex items-center justify-center  fixed  inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm"
        onClick={onClose} // Cierra el modal si se hace clic fuera
        >
        {/* Contenedor del Modal */}
        <div 
            className="relative w-full  max-w-xl rounded-lg bg-white/90 p-6 shadow-xl "
            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
        >
            {/* Encabezado del Modal */}
            <div className="flex items-start justify-between  border-b-1 border-blue-900 pb-3 ">
            <h2 className="text-xl font-semibold text-black flex">
                <MessageSquare className="text-yellow-500 mr-3"/> Gestionar Consulta #{consulta.id}
            </h2>
            <button
                onClick={onClose}
                className="text-black/70 cursor-pointer  dark:hover:text-red-700/70"
            >
                <CloseIcon />
            </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="mt-4 pl-2 max-h-[70vh] overflow-y-auto pr-2">
            {/* Sección de Información del Cliente */}
            <div className="mb-4 rounded-lg border border-gray-100 bg-white/90 p-3">
                <h3 className="mb-2 text-sm font-semibold uppercase text-black ">Cliente</h3>
                {consulta.cliente ? (
                    <>
                        <p className="text-gray-800 ">
                            <strong>Nombre:</strong> {consulta.cliente.nombre} {consulta.cliente.apellido}
                        </p>
                        <p className="text-gray-800 "><strong>DNI:</strong> {consulta.cliente.dni}</p>
                    </>
                ) : (
                    <p className="text-gray-800 dark:text-gray-200">
                        <strong>Email:</strong> {consulta.email} (Usuario no registrado)
                    </p>
                )}
                <p className="mt-1 text-xs text-black ">
                    Enviada: {format(parseISO(consulta.fecha), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                </p>
            </div>

            {/* Sección del Mensaje del Cliente */}
            <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold uppercase text-blue-900">
                Mensaje del Cliente
                </label>
                <div className="min-h-[100px] w-full rounded-lg border   border-gray-100 bg-white/90 p-3 text-black ">
                {/* Usamos 'whitespace-pre-wrap' para respetar saltos de línea */}
                <p style={{ whiteSpace: 'pre-wrap' }}>{consulta.mensaje}</p>
                </div>
            </div>

            {/* Sección de Respuesta del Operador */}
            <form onSubmit={handleSubmitRespuesta}>
                <label htmlFor="respuestaOperador" className="mb-1 block text-sm font-semibold uppercase text-red-700 ">
                {consulta.respondida ? 'Respuesta Enviada' : 'Escribir Respuesta'}
                </label>
                <textarea
                id="respuestaOperador"
                rows={6}
                className="w-full rounded-lg border  bg-white/80 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500  "///////
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                // Si ya fue respondida, se puede deshabilitar la edición
                // disabled={consulta.respondida} 
                />
                
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

                {/* Pie del Modal (Acciones) */}
                <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-600">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-gray-200 cursor-pointer text-black shadow-sm hover:bg-gray-300  "
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !currentUserId}
                    className={`rounded-lg px-4 py-2 cursor-pointer text-sm font-medium text-white shadow-sm
                    ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                    ${!currentUserId ? 'bg-gray-400 cursor-not-allowed' : ''}
                    `}
                >
                    {isSubmitting ? 'Guardando...' : (consulta.respondida ? 'Actualizar Respuesta' : 'Guardar y Marcar Respondida')}
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}

// --- Componente Principal de la Tabla ---
export default function TableAdminConsultas() {
    const [filterDni, setFilterDni] = useState("");
    const [filterEstado, setFilterEstado] = useState("todos"); // 'todos', 'pendientes', 'respondidas'

    // --- Estados para datos de Supabase ---
    const [consultas, setConsultas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados del Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsulta, setSelectedConsulta] = useState(null);

    // --- Función para cargar datos ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
        // Usamos alias para traer los datos del cliente (id_usuario) y del operador (respondida_por)
        const { data, error: dbError } = await supabase
            .from("consultas")
            .select(`
            *,
            cliente:id_usuario ( nombre, apellido, dni ),
            operador:respondida_por ( nombre, apellido, dni )
            `)
            .order('fecha', { ascending: false }); // Ordenar por fecha de consulta

        if (dbError) throw dbError;

        console.log("Datos (consultas) recibidos de Supabase:", data);
        setConsultas(data || []);

        } catch (fetchError) {
        console.error("Error fetching consultas:", fetchError);
        setError("No se pudieron cargar las consultas.");
        setConsultas([]);
        } finally {
        setIsLoading(false);
        }
    }, []);

    // --- Carga inicial de datos ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Filtrado ---
    const filteredData = consultas.filter((consulta) => {
        // Datos del cliente y operador
        const clienteDni = consulta.cliente?.dni?.toLowerCase() || '';
        const operadorDni = consulta.operador?.dni?.toLowerCase() || ''; // Puede ser null si no ha sido respondida
        const filterDniLower = filterDni.toLowerCase();

        // Filtro por DNI (comprueba tanto el DNI del cliente como el del operador)
        const matchesDni = filterDni === "" || 
                        clienteDni.includes(filterDniLower) || 
                        operadorDni.includes(filterDniLower);

        // Filtro por Estado
        const matchesEstado = filterEstado === 'todos' ||
                            (filterEstado === 'pendientes' && !consulta.respondida) ||
                            (filterEstado === 'respondidas' && consulta.respondida);

        return matchesDni && matchesEstado;
    });

    // --- Acciones del Modal ---
    const handleGestionarClick = (consulta) => {
        setSelectedConsulta(consulta);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedConsulta(null);
    };

    // --- Renderizado ---
    return (
        <div className="flex flex-col items-center p-4">
        {/* Filtros */}
        <div className="mb-4 flex w-full max-w-lg flex-col gap-4 sm:flex-row">
            <input
            type="text"
            placeholder="Buscar por DNI (cliente u operador)..."
            className="w-full bg-white rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            value={filterDni}
            onChange={(e) => setFilterDni(e.target.value)}
            />
            <select
            className="w-full bg-white rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black sm:w-1/2"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            >
            <option value="todos">Todos los estados</option>
            <option value="pendientes">Pendientes</option>
            <option value="respondidas">Respondidas</option>
            </select>
        </div>

        {/* Indicador de Carga o Error */}
        {isLoading && <p className="my-4 text-gray-600">Cargando consultas...</p>}
        {error && <p className="my-4 text-red-600">{error}</p>}

        {/* Tabla */}
        {!isLoading && !error && (
            <div className="w-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-md dark:border-white/[0.05] ">
            <div className="max-w-full overflow-x-auto">
                <Table>
                <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-700">
                    <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Estado</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cliente</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Mensaje (Extracto)</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Respondida por</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                    </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                    {filteredData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="px-5 py-4 text-center text-gray-500">
                        No se encontraron consultas con los filtros aplicados.
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredData.map((consulta) => (
                        <TableRow key={consulta.id} className="hover:bg-gray-50 dark:hover:bg-gray-400/80 hover:text-white">
                        
                        <TableCell className="px-5 py-4 text-start">
                            <Badge className={`${getStatusBadgeClass(consulta.respondida)} px-2 py-1 text-xs`}>
                            {consulta.respondida ? 'Respondida' : 'Pendiente'}
                            </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                            {consulta.cliente ? (
                            <div>
                                <span className="block text-sm font-medium text-gray-900 dark:text-black">
                                {consulta.cliente.nombre} {consulta.cliente.apellido}
                                </span>
                                <span className="block text-xs text-gray-100 dark:text-black ">
                                DNI: {consulta.cliente.dni}
                                </span>
                            </div>
                            ) : (
                            <span className="text-xs text-gray-400">Email: {consulta.email}</span>
                            )}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-sm text-gray-900 dark:text-black">
                            {format(parseISO(consulta.fecha), "dd/MM/yy 'a las' HH:mm", { locale: es })}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-sm text-gray-900 dark:text-black max-w-xs truncate">
                            {/* Mostramos solo los primeros 100 caracteres */}
                            {consulta.mensaje.substring(0, 100)}{consulta.mensaje.length > 100 ? '...' : ''}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-sm text-gray-900 dark:text-black">
                            {consulta.operador ? (
                                `${consulta.operador.nombre} ${consulta.operador.apellido}`
                            ) : (
                                <span className="text-xs text-gray-400">-</span>
                            )}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                            <button
                            className="rounded bg-blue-500 px-3 py-1 text-xs font-medium cursor-pointer text-white shadow-sm hover:bg-blue-600"
                            onClick={() => handleGestionarClick(consulta)}
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
        {isModalOpen && selectedConsulta && (
            <ModalDetalleConsulta
            consulta={selectedConsulta}
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

