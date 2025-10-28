import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../back_supabase/client";

const pageContent = {
  "/habitaciones": {
    title: "Nuestras Habitaciones",
    subtitle: "Explora nuestras opciones de alojamiento, diseñadas para ofrecerte el máximo confort y elegancia durante tu estancia",
  },
  "/reservas": {
    title: "Reservas",
    subtitle: "Gestiona las reservas de manera rápida y sencilla.",
  },

  "/adminconsultas": {
    title: "Consultas",
    subtitle: "Administra consultas de nuestros clientes.",
  },

  "/consultas": {
    title: "Consultas",
    subtitle: "¿Tienes dudas? Estamos aquí para ayudarte.",
  },
  "/admin": {
    title: "Panel de Administración",
    subtitle: "Gestiona habitaciones, usuarios y reservas desde un solo lugar.",
  },
  "/login": {
    title: "Iniciar Sesión",
    subtitle: "Accede al panel de administración del hotel.",
  },
    "/mapa": {
    title: "Mapa de Ocupación",
    subtitle: "Visualiza y gestiona el estado de todas las habitaciones en tiempo real",
  },
};

const hotelImages = [
  "/assets/piscina del hotel.png",
  "/assets/carrusel1.png",
  "/assets/carrusel2.png",
  "/assets/carrusel3.png",
];

export default function HotelHeader() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const location = useLocation();

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cambiar título de la pestaña según ruta
  useEffect(() => {
    const content = pageContent[location.pathname];
    document.title = content?.title || "Hotel M&L";
  }, [location.pathname]);

  const content = pageContent[location.pathname] || {
    title: "Hotel M&L",
    subtitle: "Tu experiencia ideal de hospedaje.",
  };

  return (
    <header className="relative h-[40vh] max-h-[400px] min-h-[200px] overflow-hidden">
      {/* Carrusel */}
      <div className="absolute inset-0">
        {hotelImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Hotel ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          </div>
        ))}
      </div>

      {/* Contenido central dinámico */}
      <div className="relative z-10 flex min-h-full mt-20 justify-center px-4 text-center">
        <div>
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-white sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg font-light leading-relaxed text-white/90 sm:text-xl">
            {content.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
