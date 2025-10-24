//este codigo es recomendado por supabase para la autenticacion del usuario, verifica el estado de la sesion y mantiene la sesion abierta. Ademas resuelve varios bugs de los navegadores.
//codigo adaptado a nuestro hotel//
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../back_supabase/client'; // Revisa que esta ruta sea correcta

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtiene la sesión inicial al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escucha cambios de autenticación (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false); // Asegura que la app se muestre tras un cambio
      }
    );

    // --- LA SOLUCIÓN DEFINITIVA ---
    // 3. Escucha cuando la pestaña del navegador se vuelve visible/oculta
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Cuando la pestaña vuelve a estar activa, forzamos a Supabase a
        // revisar y refrescar la sesión si es necesario.
        supabase.auth.startAutoRefresh();
      } else {
        // Cuando la pestaña se oculta, detenemos el refresco para ahorrar recursos.
        supabase.auth.stopAutoRefresh();
      }
    };

    // Añadimos el listener al documento
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // --- FIN DE LA SOLUCIÓN ---

    // Limpiamos todo al desmontar el componente para evitar fugas de memoria
    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // useEffect para obtener el perfil del usuario cuando la sesión cambia
  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }

    supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al obtener el perfil:", error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      });
  }, [session]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, profile, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

