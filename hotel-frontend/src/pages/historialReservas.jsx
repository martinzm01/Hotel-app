import React, { useState, useEffect,useCallback } from 'react';
import { supabase } from '../back_supabase/client'; // 1. Importar Supabase
import { useAuth } from '../context/AuthContext';    // 2. Importar el Contexto de Auth
import { useLocation } from 'react-router-dom'; // 1. Importar useLocation
import ReservaCard from '../components/ReservaCard';
import HotelHeader from '../components/headerHabitaciones';

const HistorialReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();
  const location = useLocation();

  // 1. Envolvemos fetchReservas en useCallback
  // Esto nos permite pasarla como prop de forma segura
  const fetchReservas = useCallback(async () => {
    if (!profile) {
      setLoading(false); 
      return;
    }

    try {
      // (Opcional) No ponemos setLoading(true) aquí
      // para que la recarga sea más suave
      // setLoading(true); 
      setError(null);

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          habitaciones (
            numero,
            tipo,
            imagen_url
          )
        `)
        .eq('id_usuario', profile.id)
        .order('creada', { ascending: false });

      if (error) throw error;
      setReservas(data || []); 

    } catch (err) {
      console.error("Error al cargar las reservas:", err);
      setError("No se pudieron cargar las reservas.");
    } finally {
      // Solo ponemos loading en false si venía de un estado de carga inicial
      if (loading) setLoading(false);
    }
  }, [profile, loading]); // Depende de profile (y loading para el finally)

  // 2. useEffect ahora llama a la función memorizada
  useEffect(() => {
    if (profile) { // Solo ejecuta si hay perfil
        fetchReservas();
    }
  }, [profile, location, fetchReservas]); // fetchReservas se incluye aquí
  // --- Manejo de estados en el Render ---

  // 7. Mostrar mensaje de carga
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <HotelHeader />
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700">
            Cargando tu historial...
          </h2>
        </div>
      </div>
    );
  }

  // 8. Mostrar mensaje de error
  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <HotelHeader />
        <div className="text-center py-20 bg-white max-w-lg mx-auto rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-red-600">
            ¡Oh, no!
          </h2>
          <p className="text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // 9. Renderizado normal (con datos o vacío)
  return (
    <div className="bg-gray-100 min-h-screen">
      <HotelHeader />
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-3 lg:py-10 lg:mb-5 sm:mb-2">
        

        {/* Mensaje si no hay reservas */}
        {reservas.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-700">
              Aún no tienes reservas
            </h2>
            <p className="text-gray-500 mt-2">
              ¡Tu próxima aventura te espera!
            </p>
            {/* <button className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 hover:bg-indigo-700">
              Buscar Hoteles
            </button> 
            */}
          </div>
        )}

        {/* Cuadrícula (Grid) de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-2 ">
          {reservas.map((reserva) => (
            <ReservaCard key={reserva.id} reserva={reserva} onUpdate={fetchReservas} />
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default HistorialReservas;