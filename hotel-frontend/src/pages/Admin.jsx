import React from "react";
import { useNavigate } from "react-router-dom"; // <- importante
import Footer from "../components/Footer";

export default function Admin() {
  const navigate = useNavigate(); // Hook para navegar

  return (
    <div 
      className="flex flex-col min-h-screen w-full bg-black bg-cover bg-center bg-no-repeat"
      style={{
        paddingTop:"100px",
        backgroundImage: "url('/assets/piscina del hotel.png')",
        backgroundBlendMode: "darken",
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
    >
      <main className="flex-grow flex flex-col items-center justify-center text-center text-white w-full">
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl mb-10">
          Administración
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black w-full max-w-[1200px] px-4">
          {/* Tarjeta 1 */}
          <article
            onClick={() => navigate("/adminhabitaciones")} // Navega al click
            className=" max-w-[500px] cursor-pointer mb-20 flex flex-col justify-between p-6 bg-white/95 border border-gray-200 rounded-xl shadow-xl h-[400px] transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div>
              <h2 className="text-center text-4xl  font-serif mb-4">
                Administrar Habitaciones
              </h2>
              <p>Administre las habitaciones del hotel.</p>
              <p>Modifique habitaciones existentes.</p>
              <p>Agregue habitaciones nuevas y mucho más.</p>
            </div>
            <div className="mt-6 text-center">
              <span className=" min-w-[350px] inline-block bg-black text-white rounded-md py-2 px-6 hover:bg-gray-900 transition-colors">
                Gestionar
              </span>
            </div>
          </article>

          {/* Tarjeta 2 */}
          <article
            onClick={() => navigate("/consultas")} // Navega al click
            className="cursor-pointer max-w-[500px] mb-20 flex flex-col justify-between p-6 bg-white/95 border border-gray-200 rounded-xl shadow-xl h-[400px] transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div>
              <h2 className="text-center text-4xl  mb-4 font-serif">
                Administrar Consultas
              </h2>
              <p>Gestione los servicios del hotel.</p>
              <p>Agregue, modifique o elimine servicios.</p>
              <p>Administre categorías, tarifas y disponibilidad.</p>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block min-w-[350px] bg-black text-white rounded-md py-2 px-6 hover:bg-gray-900 transition-colors">
                Gestionar
              </span>
            </div>
          </article>
        </section>
      </main>

      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
