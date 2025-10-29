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
      // No pongas setLoading(false) aquí, espera a que el perfil también cargue
    });

    // 2. Escucha cambios de autenticación (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // No pongas setLoading(false) aquí tampoco
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
    setLoading(true); // Empezamos a cargar CADA VEZ que la sesión cambie
    
    if (!session) {
      setProfile(null);
      setLoading(false); // Si no hay sesión, terminamos de cargar
      return;
    }

    // <<< ¡CAMBIO CLAVE AQUÍ! >>>
    supabase
      .from('usuarios')
      .select('*') // <-- Pedimos TODOS los datos (nombre, email, Telefono, rol, etc.)
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al obtener el perfil:", error.message);
          setProfile(null);
        } else {
          setProfile(data); // 'profile' ahora es { id: ..., nombre: ..., Telefono: ... }
        }
        setLoading(false); // Terminamos de cargar (con o sin perfil)
      });
  }, [session]); // Se ejecuta cada vez que 'session' cambia

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // <<< ¡CORRECCIÓN DE SINTAXIS AQUÍ! >>>
  const value = { session, profile, loading, logout, setProfile, setLoading };

  return (
    <AuthContext.Provider value={value}>
      {/* Mostramos 'children' solo cuando NO estamos cargando.
        Esto previene que 'ReservaModal' intente acceder a 'profile' 
        mientras 'loading' es true.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
