import { supabase } from "../back_supabase/Client";

// Función para obtener el rol del usuario logueado
export async function getUserRol() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("usuario")
        .select("rol")
        .eq("id", user.id)   
        .single();

    if (error) {
        console.error("Error obteniendo rol:", error);
        return null;
    }

    return data?.rol;
    }
