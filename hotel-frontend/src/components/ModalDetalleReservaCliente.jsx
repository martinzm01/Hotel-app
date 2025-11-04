
import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client"; // Ajusta la ruta si es necesario
import ModalPlaceholder from "./ModalPlaceholder"; // Asumo que está en la misma carpeta
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../context/AuthContext"; // 1. Importamos useAuth


export default function ModalDetalleReservaCliente({ reserva, onClose }) {
    // Estados solo para cargar el método de pago
    const [isLoadingPago, setIsLoadingPago] = useState(false);
    const [error, setError] = useState("");
    const [metodoPagoBD, setMetodoPagoBD] = useState(null);

    // 2. Obtenemos el perfil del cliente desde el contexto
    const { profile } = useAuth();

    // 3. Este useEffect se mantiene, es útil
    useEffect(() => {
        const fetchMetodoPago = async () => {
        if (
            reserva.estado_pago === "Pendiente de confirmación" ||
            reserva.estado_pago?.toLowerCase() === "pagado"
        ) {
            setIsLoadingPago(true);
            try {
            const { data, error: fetchError } = await supabase
                .from("pagos")
                .select("metodo_pago")
                .eq("id_reserva", reserva.id)
                .single();

            if (fetchError) throw fetchError;
            if (data) setMetodoPagoBD(data.metodo_pago);
            } catch (err) {
            console.error("Error al obtener método de pago:", err.message);
            setError(
                "No se pudo cargar el método de pago desde la base de datos."
            );
            } finally {
            setIsLoadingPago(false);
            }
        }
        };
        fetchMetodoPago();
    }, [reserva.id, reserva.estado_pago]);

    // 4. Footer simplificado
    const footerButtons = (
        <button
        onClick={onClose}
        className="button-secondary rounded-md p-2 px-4 text-white bg-red-700/70 hover:bg-red-700/50 hover:border-1 cursor-pointer"
        >
        Cerrar
        </button>
    );

    return (
        <ModalPlaceholder
        title={`Detalle Reserva #${reserva.id}`}
        onClose={onClose}
        footer={footerButtons}
        >
        <div className="space-y-4 text-gray-800">
            
            {/* Información General */}
            <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Información General
            </h4>
            <ul className="space-y-1 text-sm">
                <li>
                  <span className="font-medium">Habitación:</span>{" "}
                  {/* 1. Mostramos el NÚMERO de habitación */}
                  {reserva.habitaciones?.numero || `ID ${reserva.id_habitacion}`}
                </li>
                {/* 2. Agregamos el TIPO de habitación en una nueva línea */}
                <li>
                  <span className="font-medium">Tipo:</span>{" "}
                  {reserva.habitaciones?.tipo || "No especificado"}
                </li>
                {/* 5. Usamos los datos del 'profile' del contexto */}
                <li>
                <span className="font-medium">Cliente:</span>{" "}
                {profile ? `${profile.nombre} ${profile.apellido}` : `ID ${reserva.id_usuario}`}
                </li>
                {profile?.email && (
                <li>
                    <span className="font-medium">Email:</span> {profile.email}
                </li>
                )}
                <li>
                <span className="font-medium">Check-in:</span>{" "}
                {format(parseISO(reserva.fecha_inicio), "PPP", { locale: es })}
                </li>
                <li>
                <span className="font-medium">Check-out:</span>{" "}
                {format(parseISO(reserva.fecha_fin), "PPP", { locale: es })}
                </li>
            </ul>
            </div>

            {/* Estado */}
            <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Estado Actual
            </h4>
            <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                Reserva: {reserva.estado_reserva}
                </span>
                <span
                className={`px-3 py-1 rounded-full font-medium ${
                    reserva.estado_pago?.toLowerCase() === "pagado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
                >
                Pago: {reserva.estado_pago || "Pendiente"}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                Total: ${reserva.precio_total}
                </span>
            </div>
            </div>

            {/* Método de pago (Solo lectura) */}
            <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Método de pago
            </h4>
            {reserva.estado_pago === "Pendiente de confirmación" ||
            reserva.estado_pago?.toLowerCase() === "pagado" ? (
                <p className="text-gray-700 text-sm">
                {reserva.estado_pago === "Pendiente de confirmación"
                    ? "Método registrado (pendiente):"
                    : "Método utilizado:"}
                <span className="font-semibold ml-1">
                    {isLoadingPago
                    ? "Cargando..."
                    : metodoPagoBD || "No especificado"}
                </span>
                </p>
            ) : (
                <p className="text-gray-700 text-sm italic">
                {reserva.estado_pago === "Cancelado"
                    ? "El pago fue cancelado."
                    : "No hay un método de pago online registrado."}
                </p>
            )}
            </div>

            {/* 6. Bloque de "Acciones" ELIMINADO */}

            {error && (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
            )}
        </div>
        </ModalPlaceholder>
    );
    }