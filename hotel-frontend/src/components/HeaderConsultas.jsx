import React from "react";

export default function HeaderConsultas() {
  return (
    <header className="relative h-[40vh] max-h-[400px] min-h-[200px] overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img
          src="/assets/carrusel1.png" 
          
          alt="Hotel M&L"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </div>

      {/* Contenido central */}
      <div className="relative z-10 flex min-h-full mt-20 justify-center px-4 text-center">
        <div>
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-white sm:text-6xl lg:text-7xl">
            Consultas
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg font-light leading-relaxed text-white/90 sm:text-xl">
            ¿Tienes dudas? Estamos aquí para ayudarte.
          </p>
        </div>
      </div>
    </header>
  );
}