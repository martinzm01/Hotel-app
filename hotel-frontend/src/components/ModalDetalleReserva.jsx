import React, { useState, useEffect } from "react";
import { supabase } from "../back_supabase/client";
import ModalPlaceholder from "./ModalPlaceholder";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { LayoutGrid, CalendarCheck, MessageSquare } from "lucide-react";

export default function ModalDetalleReserva({ reserva, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [metodoPagoBD, setMetodoPagoBD] = useState(null); // Estado para el método de pago real

  // useEffect: Busca el método de pago si está "Pendiente de confirmación" o "Pagado"
  //    para poder mostrarlo.
  useEffect(() => {
    const fetchMetodoPago = async () => {
      if (
        reserva.estado_pago === "Pendiente de confirmación" ||
        reserva.estado_pago?.toLowerCase() === "pagado"
      ) {
        setIsLoading(true);
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
          setIsLoading(false);
        }
      }
    };

    fetchMetodoPago();
  }, [reserva.id, reserva.estado_pago]);

  // handleUpdateStatus (Sin cambios)
  const handleUpdateStatus = async (nuevoEstado) => {
    setIsLoading(true);
    setError("");
    try {
      const updatePayload = { estado_reserva: nuevoEstado };
      if (nuevoEstado === "Cancelada") {
        updatePayload.estado_pago = "Cancelado";
      }
      const { error: updateError } = await supabase
        .from("reservas")
        .update(updatePayload)
        .eq("id", reserva.id);
      if (updateError) throw updateError;
      onUpdate();
    } catch (statusError) {
      setError("Error: " + statusError.message);
      setIsLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Confirmar Pago
  //    Esta función solo actualiza el estado, ya no inserta pagos.
  const handleConfirmarPago = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Nos aseguramos de que solo actúe si el estado es el correcto
      if (reserva.estado_pago !== "Pendiente de confirmación") {
        throw new Error("La reserva no está pendiente de confirmación.");
      }

      // Solo actualizamos la reserva a Pagado/Activa
      const { error: reservaError } = await supabase
        .from("reservas")
        .update({
          estado_pago: "Pagado",
          estado_reserva: "Confirmada",
        })
        .eq("id", reserva.id);

      if (reservaError) throw reservaError;

      onUpdate();
    } catch (pagoGeneralError) {
      setError("Error al confirmar el pago: " + pagoGeneralError.message);
      setIsLoading(false);
    }
  };

  // Footer MODIFICADO:
  //    - Solo muestra el botón de "Confirmar Pago" si el estado es "Pendiente de confirmación".
  const footerButtons = (
    <div className="flex w-full justify-between items-center">
      <button
        onClick={onClose}
        className="button-secondary rounded-lg p-2 px-4 bg-white hover:bg-red-300/70 hover:border-1 hover:border-gray-200 hover:text-white cursor-pointer"
        disabled={isLoading}
      >
        Cerrar
      </button>

      {/*  Solo mostrar el botón si el estado es 'Pendiente de confirmacion' */}
      {reserva.estado_pago === "Pendiente de confirmación" &&
      reserva.estado_reserva !== "Cancelada" ? (
        <button
          onClick={handleConfirmarPago} //  Usa la nueva función
          className="button-success cursor-pointer rounded-full p-2 px-4 bg-green-900 text-white hover:bg-green-700/70 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Confirmando..." : "Confirmar Pago"}
        </button>
      ) : null}
    </div>
  );

  return (
    <ModalPlaceholder
      title={` Detalle Reserva #${reserva.id}`}
      onClose={onClose}
      footer={footerButtons}
    >
      <div className="space-y-4 text-gray-800">
        {/* Información General (Sin cambios) */}
        <div className="bg-white rounded-lg p-4 shadow border  border-gray-200">
          <h4 className="text-xl font-semibold text-gray-800 mb-3">
            Información General
          </h4>
          <ul className="space-y-1 text-sm">
            <li>
              <span className="font-medium">Habitación:</span>{" "}
              {reserva.habitaciones?.numero || `ID ${reserva.id_habitacion}`}
            </li>
            <li>
              <span className="font-medium">Cliente:</span>{" "}
              {reserva.usuarios
                ? `${reserva.usuarios.nombre} ${reserva.usuarios.apellido}`
                : `ID ${reserva.id_usuario}`}
            </li>
            {reserva.usuarios?.dni && (
              <li>
                <span className="font-medium">DNI:</span> {reserva.usuarios.dni}
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

        {/* Estado (Sin cambios) */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
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
            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800 font-medium">
              Total: ${reserva.precio_total}
            </span>
          </div>
        </div>

        {/*  Método de pago MODIFICADO:
          Se eliminó el <select> y el caso para "Pendiente".
        */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Método de pago
          </h4>

          {/* CASO 1: "Pendiente de confirmacion" o "Pagado". Mostramos el texto. */}
          {reserva.estado_pago === "Pendiente de confirmación" ||
          reserva.estado_pago?.toLowerCase() === "pagado" ? (
            <p className="text-gray-700 text-sm">
              {reserva.estado_pago === "Pendiente de confirmación"
                ? "Método registrado (pendiente):"
                : "Método utilizado:"}
              <span className="font-semibold ml-1">
                {isLoading
                  ? "Cargando..."
                  : metodoPagoBD || "No especificado"}
              </span>
            </p>
          ) : (
            /* CASO 2: Es "Cancelado", "Pendiente" (sin pago online) o cualquier otro. */
            <p className="text-gray-700 text-sm italic">
              {reserva.estado_pago === "Cancelado"
                ? "El pago fue cancelado."
                : "No hay un método de pago online registrado."}
            </p>
          )}
        </div>

        {/* Acciones (Sin cambios) */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Acciones de Estado
          </h4>
          <div className="flex flex-col gap-2">

            {reserva.estado_reserva === "Activa" && (
              <button
                onClick={() => handleUpdateStatus("Finalizada")}
                className="bg-green-900 hover:bg-green-700/70 cursor-pointer text-white font-medium py-2 rounded-lg shadow transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "..." : "Realizar Check-out"}
              </button>
            )}
            {["Pendiente", "Confirmada", "Activa"].includes(
              reserva.estado_reserva
            ) && (
              <button
                onClick={() => handleUpdateStatus("Cancelada")}
                className="bg-red-600 hover:bg-red-400/70 cursor-pointer text-white font-medium py-2 rounded-lg shadow transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "..." : "Cancelar Reserva"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </ModalPlaceholder>
  );
}