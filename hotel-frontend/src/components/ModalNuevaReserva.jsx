import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client"; // Ajusta la ruta
import ModalPlaceholder from "./ModalPlaceholder"; // Ajusta la ruta

// --- MODIFICADO: Imports de date-fns y DatePicker ---
import { format, parseISO, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// --- FIN MODIFICADO ---

// --- NUEVO: Helper de parseo de fecha (más seguro que parseISO para 'YYYY-MM-DD') ---
const parseStringToDate = (dateString) => {
    if (!dateString) return null;
    // Se usa T00:00:00 para asegurar que se parsee como fecha local
    return new Date(dateString + 'T00:00:00');
    };
    // --- FIN NUEVO ---


    // ======================================================================
    // --- SUB-COMPONENTE: ModalNuevaReserva ---
    // ======================================================================
    // --- MODIFICADO: Se exporta como default ---
export default function ModalNuevaReserva({ room, date, onClose, onSave }) {
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
    const [metodoPago, setMetodoPago] = useState("Efectivo");

    // --- NUEVO: Estados para el calendario ---
    const [occupiedDates, setOccupiedDates] = useState([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    // --- FIN NUEVO ---

    // Calcula precio (MODIFICADO para usar el helper seguro)
    useEffect(() => {
        if (date && fechaFin && room?.precio) {
        try {
            const inicio = date; // 'date' (la prop) ya es un objeto Date
            const fin = parseStringToDate(fechaFin); // Usamos el helper seguro
            const noches = differenceInDays(fin, inicio);
            setPrecioCalculado(noches > 0 ? room.precio * noches : 0);
        } catch (e) { console.error("Error calculando fechas:", e); setPrecioCalculado(0); }
        } else { setPrecioCalculado(0); }
    }, [date, fechaFin, room?.precio]);

    
    // --- NUEVO: useEffect para cargar fechas ocupadas ---
    useEffect(() => {
        // Se ejecuta solo si tenemos una habitación
        if (room?.id) { 
        const fetchOccupiedDates = async () => {
            setIsLoadingDates(true);
            
            // Llamamos a la función RPC que ya creamos
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

                    // --- INICIO DE LA MODIFICACIÓN ---

                    // 1. Sumamos 1 día al 'start'
                    // Esto deja LIBRE el día de check-in de la reserva existente,
                    // permitiendo que se seleccione como check-out de la nueva reserva.
                    if (start) {
                        start.setDate(start.getDate() + 1);
                    }

                    // 2. Restamos 1 día al 'end' (esta lógica ya la tenías y es correcta)
                    // Esto deja LIBRE el día de check-out de la reserva existente,
                    // permitiendo que se seleccione como check-in (en otro modal).
                    if (end) {
                        end.setDate(end.getDate() - 1);
                    }
                    
               // --- FIN DE LA MODIFICACIÓN ---

                    return { start, end };
                });

                // Filtramos intervalos inválidos (donde start > end)
                // (Esto sucede en reservas de 1 noche y previene errores)
                const validIntervals = intervals.filter(interval => {
                    if (!interval.start || !interval.end) return false;
                    return interval.end >= interval.start;
                });
            setOccupiedDates(intervals);
            }
            setIsLoadingDates(false);
        };
        fetchOccupiedDates();
        }
    }, [room?.id]); // Se ejecuta cuando el 'room' está disponible
    // --- FIN NUEVO ---


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

    // 🔹 Confirma y guarda la reserva (MODIFICADO con doble chequeo)
    const handleConfirmReserva = async (e) => {
        e.preventDefault();
        if (precioCalculado <= 0 || !fechaFin) { setError("Fecha de check-out inválida."); return; }
        if (!cliente) { setError("Cliente no identificado."); return; }
        setIsLoading(true); setError("");

        const fechaInicio = date; // 'date' prop
        const fechaFinDate = parseStringToDate(fechaFin);

        try {
        // --- NUEVO: Doble chequeo de seguridad con RPC ---
            const { data: existingBookingsData, error: checkError } = await supabase.rpc('get_fechas_ocupadas', {
                p_id_habitacion: room.id
            });

            if (checkError) {
                throw new Error("Error al verificar disponibilidad. Intente de nuevo.");
            }

            if (existingBookingsData) {
                const newStart = fechaInicio;
                const newEnd = fechaFinDate;

                for (const reserva of existingBookingsData) {
                const existingStart = parseStringToDate(reserva.fecha_inicio);
                const existingEnd = parseStringToDate(reserva.fecha_fin);

                // Lógica de superposición
                const overlap = newStart < existingEnd && newEnd > existingStart;
                if (overlap) {
                    throw new Error("¡Ups! Alguien acaba de reservar estas fechas. Por favor, selecciona otras.");
                }
                }
            }
            // --- FIN NUEVO CHEQUEO ---


            // 1. Insertar la reserva (Tu lógica original)
            const { data: reservaData, error: reservaError } = await supabase
                .from("reservas")
                .insert({
                id_habitacion: room.id,
                id_usuario: cliente.id,
                fecha_inicio: format(date, "yyyy-MM-dd"), // 'date' es la prop
                fecha_fin: fechaFin, // 'fechaFin' es el string del estado
                estado_reserva: "Confirmada", 
                estado_pago: "Pagado",   
                precio_total: precioCalculado
                })
                .select() 
                .single(); 

            if (reservaError) throw reservaError;
            if (!reservaData) throw new Error("No se pudo crear la reserva.");

            // 2. Insertar en la tabla de pagos (Tu lógica original)
            const { error: pagoError } = await supabase
                .from("pagos")
                .insert({
                id_reserva: reservaData.id,
                monto: precioCalculado,
                metodo_pago: metodoPago,
                fecha_pago: new Date().toISOString(),
                });

            if (pagoError) {
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
        footer={<button onClick={onClose} className="button-secondary rounded-full bg-gray-100 p-1 pl-2 pr-2 cursor-pointer hover:bg-gray-200 hover:border-1 border-gray-300" disabled={isLoading || isLoadingDates}>Cancelar</button>}
        >
        {/* --- PASO 1 (MODIFICADO por 'isLoadingDates') --- */}
        {step === 1 && (
            <div className="p-4 pb-1  bg-gray-50 rounded-lg shadow-inner ">
            <form onSubmit={handleSearch} className="space-y-4">
                <label className="label-style text-base font-semibold text-gray-800">Paso 1: Identificar Cliente</label>
                <input type="email" placeholder="Buscar por Email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="input-style ml-3 rounded-sm pl-2 border-1 border-gray-700 min-w-50 " required disabled={isLoading || isLoadingDates}/>
                <button type="submit" className="button-primary w-full mt-5 mb-5  cursor-pointer border-green-200 rounded-lg bg-green-100 hover:border-1 hover:bg-emerald-100" disabled={isLoading || isLoadingDates}>
                {isLoading && searchStatus === "loading" ? "Buscando..." : "Buscar Cliente"}
                </button>
            </form>
            </div>
        )}

        {/* --- FORMULARIO DE CREACIÓN (MODIFICADO por 'isLoadingDates') --- */}
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
                <div><label className="label-style">Nombre</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="input-style rounded-lg mt-1 ml-2 border-black border-1 pl-2" required disabled={isLoading || isLoadingDates}/></div>
                <div><label className="label-style">Apellido</label><input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="input-style mt-1 ml-2 border-black border-1 pl-2 rounded-lg" required disabled={isLoading || isLoadingDates}/></div>
                <div><label className="label-style">DNI</label><input type="text" value={dni} onChange={e => setDni(e.target.value)} className="input-style mt-1 ml-10 border-black border-1 pl-2 rounded-lg " required disabled={isLoading || isLoadingDates}/></div>
        
                <button type="submit" className="button-success w-full max-w-50  bg-green-100 cursor-pointer rounded-lg mt-3 hover:shadow-2xl- hover:border-1 border-green-200" disabled={isLoading || isLoadingDates}>
                {isLoading ? "Creando..." : "Crear e Invitar Cliente"}
                </button>
            </div>
            </form>
        )}

        {/* --- PASO 2 (MODIFICADO con DatePicker) --- */}
        {step === 2 && cliente && (
            <form onSubmit={handleConfirmReserva} className="space-y-3 ml-5 mr-5">
            <div className="rounded bg-green-100 p-2 text-sm text-green-800">Cliente: {cliente.nombre} {cliente.apellido} (DNI: {cliente.dni})</div>
            <p className="text-sm font-medium text-gray-800 pl-1">Habitación: {room?.numero} ({room?.type})</p>
            <p className="text-sm font-medium text-gray-800 pl-1">Check-in: {format(date, "PPP", { locale: es })}</p>
            
            {/* --- REEMPLAZO DE INPUT POR DATEPICKER --- */}
            <div>
                <label className="label-style mr-2 pl-1">Fecha de salida</label>
                <DatePicker
                selected={fechaFin ? parseStringToDate(fechaFin) : null}
                onChange={(d) => setFechaFin(format(d, "yyyy-MM-dd"))}
                excludeDateIntervals={occupiedDates}
                minDate={addDays(date, 1)} // 'date' es la prop de check-in
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                className="input-style mt-1 cursor-pointer bg-gray-100 rounded-b-md border-1 border-gray-300 pl-2 pr-2"
                required
                disabled={isLoading || isLoadingDates}
                />
            </div>
            {/* --- FIN REEMPLAZO --- */}

            
            {/*  MÉTODO DE PAGO  */}
            <div>
                <label htmlFor="metodoPago" className="label-style pl-1">Método de Pago</label>
                <select
                id="metodoPago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="input-style mt-1  bg-gray-100 rounded-full p-1 border-1 border-gray-300 cursor-pointer ml-3"
                disabled={isLoading || isLoadingDates}
                >
                <option className="bg-gray-white" value="Visa">Tarjeta Visa</option>
                <option value="Mastercard">Tarjeta Mastercard</option>
                <option value="American Express">American Express</option>
                <option value="Naranja">Tarjeta Naranja</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                </select>
            </div>
            
            {precioCalculado > 0 && <p className="text-lg font-semibold text-black text-center mt-5">Precio Total: ${precioCalculado}</p>}
            
            <button type="submit" className="button-primary w-full mt-5 pt-1 pb-1  cursor-pointer rounded-md text-white bg-red-500 hover:bg-red-800" disabled={isLoading || isLoadingDates || precioCalculado <= 0}>
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