import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Footer from "../components/footer";
import { BedDouble, UserCog } from "lucide-react";
import HotelHeader from "../components/headerHabitaciones";
export default function Admin() {
  const location = useLocation();

  // Detecta si estás en la ruta base (/admin)
  const isDashboard = location.pathname === "/admin";


  return (
    <div className="flex flex-col min-h-screen bg-black" >
      <main
        className="flex-grow flex flex-col items-center justify-center text-center pb-20 pt-5   text-white w-full
        bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage: "url('/assets/piscina del hotel.png')",
          backgroundBlendMode: "darken",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="mt-10  pt-10">
        <h2 className="font-serif text-light font-light text-foreground text-7xl pt-5">

          Administración de Habitaciones
        </h2>
        </div>
        {isDashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl p-8 pt-1  mb-10 ">
            {/* Tarjeta 1 -Administración de Habitaciones */}
            <NavLink
              to="/admin/habitaciones"
              className="group bg-gray-800/70 hover:bg-gray-700/70 rounded-2xl shadow-lg p-10 mr-2 pt-20 pb-20 mt-20  text-center flex flex-col items-center transition-transform transform hover:scale-105"
            >
              <BedDouble className="w-16 h-16 mb-4 text-blue-400 group-hover:animate-pulse" />
              <h2 className="text-2xl font-medium mb-2 font-serif">
                Administración de Habitaciones
              </h2>
              <p className="text-gray-300 text-sm">
                Crea, edita o elimina habitaciones y gestiona su información.
              </p>
            </NavLink>

            {/*Tarjeta 2 - Gestión de Operadores */}
            <NavLink
              to="/admin/operadores"
              className="group bg-gray-800/70 hover:bg-gray-700/70 rounded-2xl shadow-lg p-10 pt-20 pb-20 mt-20 text-center flex flex-col items-center transition-transform transform hover:scale-105"
            >
              <UserCog className="w-16 h-16 mb-4 text-green-400 group-hover:animate-pulse" />
              <h2 className="text-2xl font-medium mb-2 font-serif">
                Gestión de Operadores
              </h2>
              <p className="text-gray-300 text-sm">
                Asigna o revoca permisos de operador y administra sus accesos.
              </p>
            </NavLink>
          </div>
        ) : (
          <div className="w-full max-w-7xl px-4 py-8">
            <Outlet />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
