import { useState, useEffect } from 'react';
import { supabase } from '../back_supabase/client'; // Asegúrate de que la ruta sea correcta

const useSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    // Escuchar los eventos de autenticación para actualizar la sesión
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return session;
};

export { useSession };