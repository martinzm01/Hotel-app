import { createClient } from "@supabase/supabase-js";

// Tu código original para obtener las claves
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Añadimos un objeto de configuración para forzar el comportamiento correcto
const options = {
  auth: {
    // 1. Guarda la sesión en localStorage para que persista al cerrar el navegador
    persistSession: true, 
    // 2. Refresca el token automáticamente para que no caduque mientras usas la app
    autoRefreshToken: true,
  },
};

// Pasamos las 'options' como tercer argumento
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);