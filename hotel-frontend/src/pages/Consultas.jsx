import React, { useState, useEffect, useCallback } from 'react'; // Añadido useCallback
import emailjs from '@emailjs/browser';
import { supabase } from "../back_supabase/client";
import { useSession } from "../utils/useSession";
import HeaderConsultas from "../components/HeaderConsultas";
import Footer from "../components/footer";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Tus FAQs (sin cambios) ---
const faqsData = [
  {
    question: "¿Cuáles son los horarios de registro de llegada y salida en Hotel M&L?",
    answer: "El registro de llegada es a partir de las 14:00 y la salida hasta las 11:00 del mediodía.",
  },
  {
    question: "¿El Hotel M&L admite mascotas?",
    answer: "Sí, se permiten mascotas pequeñas bajo previa consulta y con cargos adicionales.",
  },
  {
    question: "¿Cuáles son las opciones de estacionamiento en Hotel M&L?",
    answer: "Contamos con estacionamiento privado para huéspedes, sujeto a disponibilidad.",
  },
  {
    question: "¿Qué comodidades en el hotel están disponibles en el Hotel M&L?",
    answer: "Ofrecemos piscina, restaurante, WiFi gratis y más.",
  },
  {
    question: "¿Tiene el Hotel M&L acceso WiFi gratis en la habitación?",
    answer: "Sí, el acceso a WiFi es gratuito y está disponible en todas las habitaciones.",
  },
  {
    question: "¿Cuál es el aeropuerto más cercano al Hotel M&L?",
    answer: "El Aeropuerto Internacional Martín Miguel de Güemes, ubicado a 10 minutos en auto.",
  },
];

export default function Consultas() {
  const [openIndex, setOpenIndex] = useState(null);
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState(null);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [mensajeEstadoEmail, setMensajeEstadoEmail] = useState(null);

  const session = useSession();
  const [consultas, setConsultas] = useState([]);
  const [reservas, setReservas] = useState([]); // Mantenemos la lógica de reservas
  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [errorConsultas, setErrorConsultas] = useState(null);
  const [errorReservas, setErrorReservas] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  // --- 1. LÓGICA DE FETCH MEJORADA ---

  // Definimos fetchConsultas fuera del useEffect para poder llamarla al guardar
  const fetchConsultas = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoadingConsultas(true);
    setErrorConsultas(null);
    try {
      // *** CAMBIO: Traemos los datos del operador como en tu segundo código ***
      const { data, error } = await supabase
        .from("consultas")
        .select(`
          *,
          operador:respondida_por ( nombre, apellido )
        `)
        .eq("id_usuario", session.user.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error("Error al cargar consultas:", error);
      setErrorConsultas("No se pudieron cargar tus consultas.");
      setConsultas([]);
    } finally {
      setLoadingConsultas(false);
    }
  }, [session?.user?.id]); // Depende del ID de sesión

  // Mantenemos la función de fetchReservas
  const fetchReservas = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoadingReservas(true);
    setErrorReservas(null);
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .eq("id_usuario", session.user.id)
        .order("fecha_inicio", { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setErrorReservas("No se pudieron cargar tus reservas.");
      setReservas([]);
    } finally {
      setLoadingReservas(false);
    }
  }, [session?.user?.id]);

  // useEffect ahora solo llama a las funciones
  useEffect(() => {
    if (session?.user?.id) {
      fetchConsultas();
      fetchReservas();
    }
  }, [session?.user?.id, fetchConsultas, fetchReservas]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // --- 2. FUNCIÓN DE GUARDAR (handleSubmit) ACTUALIZADA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensajeEstado(null);

    try {
      const { error } = await supabase.from("consultas").insert([
        {
          id_usuario: session?.user?.id,
          email: email,
          mensaje: mensaje,
          fecha: new Date().toISOString(),
          respondida: false,
          respuesta: null,
          respondida_por: null,
        },
      ]);

      if (error) throw error;

      setMensaje(""); // Limpia solo el mensaje
      setMensajeEstado({
        tipo: "éxito",
        texto: "¡Consulta guardada correctamente!",
      });

      // *** CAMBIO: Refresca la lista de consultas después de guardar ***
      fetchConsultas();

    } catch (error) {
      console.error("Error al enviar la consulta:", error);
      setMensajeEstado({
        tipo: "error",
        texto: "Error al guardar la consulta. Inténtalo de nuevo.",
      });
    } finally {
      setEnviando(false);
    }
  };

  // --- 3. FUNCIÓN DE EMAILJS (con parámetros corregidos) ---
  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (!email || !mensaje) {
      setMensajeEstadoEmail({
        tipo: "error",
        texto: "Por favor, completa el email y el mensaje antes de enviar.",
      });
      return;
    }

    setEnviandoEmail(true);
    setMensajeEstadoEmail(null);

    // *** CAMBIO: Ajustado a los parámetros de tu imagen ({{name}}, {{email}}) ***
    const templateParams = {
      email: email,     // Para el campo "Reply To" ({{email}})
      name: email,      // Para el campo "From Name" ({{name}}), usamos el email
      message: mensaje, // Asumo que el cuerpo de tu email usa {{message}}
    };

    emailjs.send(
        'service_ct3rzb6',  
        'template_hbdz47f',  
        templateParams,
        'LmVEWUcqNelgt4cEh'  
      )
      .then((response) => {
        console.log('EMAILJS SUCCESS!', response.status, response.text);
        setMensajeEstadoEmail({
          tipo: "éxito",
          texto: "¡Consulta enviada por email correctamente!",
        });
        setMensaje(""); // Limpia el mensaje después de enviar
      })
      .catch((err) => {
        console.error('EMAILJS FAILED...', err);
        setMensajeEstadoEmail({
          tipo: "error",
          texto: "Error al enviar el email. Inténtalo de nuevo.",
        });
      })
      .finally(() => {
        setEnviandoEmail(false);
      });
  };

  return (
    <main>
      <HeaderConsultas />

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
              Formulario de Consulta
            </h2>

            {/* Formulario y mensajes de estado (sin cambios) */}
            {mensajeEstado && (
              <div
                className={`text-center mb-4 ${
                  mensajeEstado.tipo === "éxito" ? "text-green-600" : "text-red-600"
                }`}
              >
                {mensajeEstado.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8">
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="mensaje"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Mensaje:
                </label>
                <textarea
                  id="mensaje"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={enviando}
                  className={`bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    enviando ? "opacity-75 cursor-wait" : "cursor-pointer"
                  }`}
                >
                  {enviando ? "Guardando Consulta..." : "Enviar Consulta (Guardar)"}
                </button>
                              <button
                onClick={handleEmailSubmit}
                disabled={enviandoEmail}
                className={`bg-gray-800 hover:bg-gray-700 ml-10 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block ${
                  enviandoEmail ? "opacity-75 cursor-wait" : "cursor-pointer"
                }`}
              >
                {enviandoEmail ? "Enviando Mail..." : "Enviar Consulta por Mail"}
              </button>
                {mensajeEstadoEmail && (
                <div
                  className={`text-center mb-4 ${
                    mensajeEstadoEmail.tipo === "éxito" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {mensajeEstadoEmail.texto}
                </div>
              )}
              </div>
            </form>

            <hr className="my-8 border-gray-300" />

            {/* --- 4. SECCIÓN "MIS CONSULTAS" ACTUALIZADA --- */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Mis Consultas (Guardadas)
              </h3>
              {loadingConsultas && <p className="text-gray-600">Cargando tus consultas...</p>}
              {errorConsultas && <p className="text-red-600">{errorConsultas}</p>}
              {!loadingConsultas && !errorConsultas && consultas.length === 0 && (
                <p className="text-gray-500">No has realizado ninguna consulta.</p>
              )}
              {!loadingConsultas && !errorConsultas && consultas.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Mensaje
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                        {/* *** CAMBIO: Columnas añadidas *** */}
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Respuesta
                        </th>

                      </tr>
                    </thead>
                    <tbody>
                      {consultas.map((consulta) => (
                        <tr key={consulta.id}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {format(parseISO(consulta.fecha), "dd/MM/yy 'a las' HH:mm", {
                              locale: es,
                            })}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {consulta.mensaje.substring(0, 100)}
                            {consulta.mensaje.length > 100 ? "..." : ""}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {consulta.respondida ? "Respondida" : "Pendiente"}
                          </td>
                          {/* *** CAMBIO: Celdas añadidas *** */}
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {consulta.respuesta || '-'}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {consulta.operador ? `${consulta.operador.nombre} ${consulta.operador.apellido}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <hr className="my-8 border-gray-300" />


            <hr className="my-8 border-gray-300" />

            {/* --- Sección FAQs (sin cambios) --- */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Preguntas frecuentes
              </h3>
              {faqsData.map((faq, index) => (
                <div key={index} className="mb-4">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full bg-none border-none border-b border-gray-300 py-2 text-left text-gray-700 font-semibold flex justify-between items-center"
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <span>{faq.question}</span>
                    <span className="text-xl select-none">
                      {openIndex === index ? "▲" : "▼"}
                    </span>
                  </button>
                  {openIndex === index && (
                    <p
                      id={`faq-answer-${index}`}
                      aria-labelledby={`faq-question-${index}`}
                      className="py-2 leading-relaxed text-gray-600"
                    >
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </section>

            <hr className="my-8 border-gray-300" />

            {/* --- Sección EmailJS (sin cambios) --- */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Consultas por Mail
              </h2>
              <p className="text-gray-600 mb-6">
                ¿Tiene alguna pregunta? Envíenos un correo electrónico.
              </p>
              
              {mensajeEstadoEmail && (
                <div
                  className={`text-center mb-4 ${
                    mensajeEstadoEmail.tipo === "éxito" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {mensajeEstadoEmail.texto}
                </div>
              )}

              <button
                onClick={handleEmailSubmit}
                disabled={enviandoEmail}
                className={`bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block ${
                  enviandoEmail ? "opacity-75 cursor-wait" : "cursor-pointer"
                }`}
              >
                {enviandoEmail ? "Enviando Mail..." : "Enviar Consulta por Mail"}
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
