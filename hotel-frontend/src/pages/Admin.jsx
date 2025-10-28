import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Footer from "../components/footer";

export default function Admin() {
  const location = useLocation();
  
  // Determinamos si estamos en la página principal de /admin o en una sub-ruta
  const isDashboard = location.pathname === '/admin';

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

        {/* Si estamos en /admin, mostramos las tarjetas de navegación.
          Si estamos en una sub-ruta (ej. /admin/habitaciones), se mostrará el Outlet.
        */}
        {isDashboard ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black w-full max-w-[1200px] px-4">
            {/* Tarjeta 1 - Corregida para usar NavLink */}
            <NavLink
              to="/admin/habitaciones" // Ruta anidada correcta
              className="max-w-[500px] cursor-pointer mb-20 flex flex-col justify-between p-6 bg-white/95 border border-gray-200 rounded-xl shadow-xl h-[400px] transition-transform duration-300 hover:scale-104 hover:shadow-2xl no-underline"
            >
              <div>
                <h2 className="text-center text-4xl font-serif mb-4">
                  Administrar Habitaciones
                </h2>
                <p>Administre las habitaciones del hotel.</p>
                <p>Modifique habitaciones existentes.</p>
                <p>Agregue habitaciones nuevas y mucho más.</p>
              </div>
              <div className="mt-6 text-center">
                <span className="min-w-[350px] inline-block bg-black text-white rounded-md py-2 px-6 hover:bg-gray-900 transition-colors">
                  Gestionar
                </span>
              </div>
            </NavLink>

            {/* Tarjeta 2 - Corregida para usar NavLink */}
            <NavLink
              to="/admin/operadores" // Ruta anidada correcta
              className="cursor-pointer max-w-[500px] mb-20 flex flex-col justify-between p-6 bg-white/95 border border-gray-200 rounded-xl shadow-xl h-[400px] transition-transform duration-300 hover:scale-104 hover:shadow-2xl no-underline"
            >
              <div>
                <h2 className="text-center text-4xl mb-4 font-serif">
                  Administrar Operadores
                </h2>
                <p>Gestione los operadores.</p>
                <p>Agregue, modifique o elimine operadores.</p>
              </div>
              <div className="mt-6 text-center">
                <span className="inline-block min-w-[350px] bg-black text-white rounded-md py-2 px-6 hover:bg-gray-900 transition-colors">
                  Gestionar
                </span>
              </div>
            </NavLink>
          </section>
        ) : (
          // Cuando no estamos en /admin, mostramos el contenido de la sub-ruta
          <div className="w-full max-w-7xl px-4">
              <Outlet />
          </div>
        )}
      </main>

      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}

