import React, { useState } from "react";
import { supabase } from "../back_supabase/client"; // Ajusta la ruta
import ModalPlaceholder from "./ModalPlaceholder"; // Ajusta la ruta
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// --- AÑADIMOS export default ---
export default function ModalDetalleReserva({ reserva, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('Efectivo');

  // Actualiza estado de RESERVA
  const handleUpdateStatus = async (nuevoEstado) => {
    setIsLoading(true); setError("");
    try {
      // Asegúrate que tu PK de reservas se llama 'id'
      const { error: updateError } = await supabase
        .from("reservas").update({ estado_reserva: nuevoEstado }).eq("id", reserva.id);
      if (updateError) throw updateError;
      onUpdate(); // Refresca y cierra
    } catch (statusError) { setError("Error: " + statusError.message); setIsLoading(false); }
  };

  // Registra pago
  const handleRegistrarPago = async () => {
    setIsLoading(true); setError("");
    try {
      // --- PASO 1: Insertar en la tabla 'pagos' ---
      const { error: pagoError } = await supabase.from("pagos").insert({
        // Usa la PK correcta de la reserva (asumiendo 'id')
        id_reserva: reserva.id,
        monto: reserva.precio_total, // Asume pago completo
        metodo_pago: metodoPagoSeleccionado,
        // Asegúrate que tu columna en 'pagos' se llama 'fecha_pago'
        fecha_pago: new Date().toISOString()
      });
      if (pagoError) throw pagoError;

      // --- PASO 2: Actualizar 'estado_pago' en la reserva ---
      const { error: reservaError } = await supabase
        .from("reservas")
        // Usa el valor exacto que quieres (ej. 'Pagado')
        .update({ estado_pago: "Pagado" })
        // Asegúrate que la PK de reservas es 'id'
        .eq("id", reserva.id);
      if (reservaError) console.warn("Pago insertado pero falló update en reserva:", reservaError);

      console.log("Pago registrado exitosamente");
      onUpdate(); // Refresca y cierra

    } catch (pagoGeneralError) {
      setError("Error al registrar el pago: " + pagoGeneralError.message);
      setIsLoading(false); // Permite reintentar
    }
  };

  // Botones del footer
  const footerButtons = (
    <div className="flex w-full justify-between items-center">
      <button onClick={onClose} className="button-secondary rounded-full p-2 pr-4 pl-4 bg-gray-100 hover:bg-gray-200 cursor-pointer" disabled={isLoading}> Cerrar </button>
      {reserva.estado_pago?.toLowerCase() !== "pagado" && (
        <button onClick={handleRegistrarPago} className="button-success rounded-full p-2 pr-4 pl-4 bg-gray-100 hover:bg-gray-200 cursor-pointer" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Registrar Pago"}
        </button>
      )}
    </div>
  );

    return (
    <ModalPlaceholder
      title={`Detalle Reserva #${reserva.id}`}
      onClose={onClose}
      footer={footerButtons}
    >
      <div className="space-y-4 text-gray-800">
        {/* Información General */}
        <div className="bg-gray-50 rounded-xl p-4 shadow border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
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

        {/* Estado */}
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
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

        {/* Método de pago */}
        {reserva.estado_pago?.toLowerCase() !== "pagado" && (
          <div className="bg-gray-50 rounded-xl p-4 shadow border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Método de pago
            </h4>
            <select
              id="metodoPago"
              value={metodoPagoSeleccionado}
              onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Visa">Tarjeta Visa</option>
              <option value="Mastercard">Tarjeta Mastercard</option>
              <option value="American Express">American Express</option>
              <option value="Naranja">Tarjeta Naranja</option>
            </select>
          </div>
        )}

        {/* Acciones */}
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Acciones de Estado
          </h4>
          <div className="flex flex-col gap-2">
            {reserva.estado_reserva === "Confirmada" && (
              <button
                onClick={() => handleUpdateStatus("Activa")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "..." : "Realizar Check-in"}
              </button>
            )}

            {reserva.estado_reserva === "Activa" && (
              <button
                onClick={() => handleUpdateStatus("Finalizada")}
                className="bg-green-900 hover:bg-green-700 cursor-pointer text-white font-medium py-2 rounded-lg shadow transition disabled:opacity-50"
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
                className="bg-red-600 hover:bg-red-800 cursor-pointer text-white font-medium py-2 rounded-lg shadow transition disabled:opacity-50"
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