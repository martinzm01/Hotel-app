// supabase/functions/invite-user/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// Importa el cliente de Supabase
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Importa los encabezados CORS estándar
import { corsHeaders } from './_shared/cors.ts'; // Necesitamos crear este archivo

// Función principal que maneja las solicitudes HTTP
serve(async (req: Request) => {
  // Manejo de solicitud OPTIONS (preflight CORS) - Importante para el navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Obtener datos del cuerpo de la solicitud (desde tu React app)
    const { email, nombre, apellido, dni } = await req.json();

    // Validación básica de entrada
    if (!email || !nombre || !apellido || !dni) {
      throw new Error("Faltan datos requeridos: email, nombre, apellido, dni.");
    }

    // 2. Crear un cliente Supabase con ROL DE SERVICIO (Admin)
    // ¡IMPORTANTE! Usa variables de entorno para las claves.
    const supabaseAdminClient: SupabaseClient = createClient(
      // Usa los nuevos nombres de los secretos
      Deno.env.get("PROJECT_URL") ?? '', // <-- CAMBIADO
      Deno.env.get("SERVICE_ROLE_KEY") ?? '', // <-- CAMBIADO
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Invitar al usuario usando el cliente Admin de Auth
    console.log(`[invite-user] Intentando invitar a: ${email}`);
    const { data: inviteData, error: inviteError } = await supabaseAdminClient.auth.admin.inviteUserByEmail(
      email
      // Opcional: Redirección después de aceptar la invitación
      // { redirectTo: 'http://localhost:5173/welcome' } // Ajusta tu URL de desarrollo/producción
    );

    if (inviteError) {
      // Manejar error si el usuario ya existe
      if (inviteError.message.includes("User already registered")) {
        console.warn(`[invite-user] Email ya registrado: ${email}`);
        // Decide qué hacer: ¿Devolver error o buscar y devolver el usuario existente?
        // Por ahora, devolvemos un error claro al operador.
        throw new Error(`El email ${email} ya está registrado en el sistema.`);
      }
      // Otros errores inesperados de autenticación
      console.error("[invite-user] Error de Supabase Auth Invite:", inviteError);
      throw inviteError; // Lanza el error original para un diagnóstico más detallado
    }

    // Verificar que la invitación devolvió datos del usuario
    if (!inviteData?.user) {
      throw new Error("[invite-user] Invitación enviada, pero Supabase Auth no devolvió datos del usuario.");
    }
    const newUserAuthId = inviteData.user.id; // ID UUID del nuevo usuario en auth.users
    console.log(`[invite-user] Usuario invitado con ID de Auth: ${newUserAuthId}`);

    // 4. Insertar el perfil del usuario en tu tabla 'usuarios'
    console.log(`[invite-user] Insertando perfil para el usuario ${newUserAuthId}...`);
    const { data: profileData, error: profileError } = await supabaseAdminClient
      .from("usuarios") // Tu tabla de perfiles/usuarios
      .insert({
        id: newUserAuthId, // Vincula con el ID de auth.users (UUID)
        email: email,      // Guarda el email también en tu tabla (útil)
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        rol: "cliente",    // Asigna el rol 'cliente' por defecto
      })
      .select()            // Devuelve la fila recién creada
      .single();           // Esperamos solo una fila como resultado

    // Si falla la inserción del perfil (raro, pero posible si hay constraints)
    if (profileError) {
      console.error("[invite-user] Error al insertar perfil en 'usuarios':", profileError);
      // Consideración: Si esto falla, el usuario existe en Auth pero no en tu tabla.
      // Podrías intentar borrar el usuario de Auth para limpiar:
      // await supabaseAdminClient.auth.admin.deleteUser(newUserAuthId);
      throw new Error(`Error al crear el perfil del usuario: ${profileError.message}`);
    }
    console.log("[invite-user] Perfil de usuario creado:", profileData);

    // 5. Devolver una respuesta exitosa con los datos del perfil creado
    return new Response(
      JSON.stringify({ user: profileData }), // Devuelve el perfil completo de la tabla 'usuarios'
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // OK
      }
    );

  } catch (error) {
    // Captura cualquier error durante el proceso (validación, auth, db)
    console.error("[invite-user] Error general en la Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        // Devuelve 400 si es un error esperado del cliente (email duplicado, datos faltantes)
        // Devuelve 500 si es un error inesperado del servidor
        status: error.message.includes("ya está registrado") || error.message.includes("Faltan datos") ? 400 : 500,
      }
    );
  }
});
