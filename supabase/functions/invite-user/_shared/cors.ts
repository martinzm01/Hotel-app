// supabase/functions/_shared/cors.ts

// Estos son los encabezados necesarios para permitir que tu aplicación frontend
// (ej. localhost:5173 o tu dominio en Vercel/Netlify) llame a la Edge Function.
export const corsHeaders = {
  // En desarrollo, '*' es más fácil. En producción, reemplázalo con la URL
  // exacta de tu frontend (ej. 'https://tu-hotel-app.vercel.app') por seguridad.
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
