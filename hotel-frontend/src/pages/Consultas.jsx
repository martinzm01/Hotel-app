import React, { useState } from "react";
import Footer from "../components/Footer";
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
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const emailAddress = "consultashotelmyl@yopmail.com";
  const emailSubject = "Consulta desde la página web";
  const emailBody = "Estimado Hotel M&L,\n\nQuería realizar la siguiente consulta:\n\n";
  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div
      style={{
        backgroundImage: "url('/assets/carrusel1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // 🔹 hace que el fondo llegue hasta abajo
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(0, 0, 0, 0.5)", //  capa oscura encima
        backgroundBlendMode: "darken",
      }}
    >      
      <div
        style={{
          maxWidth: "600px",
          margin: "100px auto", // 🔹 agrega espacio arriba y abajo
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          fontFamily: "'Georgia', serif",
          color: "#222",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "0.5em" }}>Consultas por Mail</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5em" }}>
          ¿Tiene alguna pregunta? Envíenos un correo electrónico.
        </p>

        <div style={{ textAlign: "center" }}>
          <a
            href={mailtoLink}
            style={{
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "12px 25px",
              cursor: "pointer",
              fontSize: "1rem",
              fontFamily: "'Georgia', serif",
              transition: "background-color 0.3s",
              textDecoration: "none",
              display: "inline-block",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#555")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#333")}
          >
            Enviar Consulta por Mail
          </a>
        </div>

        <hr style={{ margin: "40px 0", borderColor: "#ccc" }} />

        <section>
          <h3 style={{ marginBottom: "1em", borderBottom: "1px solid #ccc", paddingBottom: "0.3em" }}>
            Preguntas frecuentes
          </h3>

          {faqsData.map((faq, index) => (
            <div key={index} style={{ marginBottom: "1em" }}>
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid #ddd",
                  padding: "10px 0",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontFamily: "'Georgia', serif",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span>{faq.question}</span>
                <span style={{ fontSize: "1.3rem", userSelect: "none" }}>
                  {openIndex === index ? "▲" : "▼"}
                </span>
              </button>

              {openIndex === index && (
                <p
                  id={`faq-answer-${index}`}
                  aria-labelledby={`faq-question-${index}`}
                  style={{ padding: "10px 0 0 0", lineHeight: "1.5", color: "#555" }}
                >
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </section>
      </div>
      <Footer/>
    </div>
  );
}
