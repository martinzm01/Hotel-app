import { Link } from "react-router-dom";
import { Package, History, Truck } from "lucide-react";

export default function ComprasInicio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white flex flex-col items-center justify-center px-6 py-10">
      {/* Título principal */}
      <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-wide text-center">
        🎶 Sector de Compras – Tienda de Vinilos
      </h1>

      {/* Contenedor de los 3 frames */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        
        {/* Frame 1: Gestión de Productos */}
        <Link
          to="/gestion-productos"
          className="group bg-gray-800 hover:bg-gray-700 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center transition-transform transform hover:scale-105"
        >
          <Package className="w-16 h-16 mb-4 text-yellow-400 group-hover:animate-pulse" />
          <h2 className="text-2xl font-semibold mb-2">Gestión de Productos</h2>
          <p className="text-gray-300 text-sm">
            Agrega, modifica o elimina vinilos del catálogo.
          </p>
        </Link>

        {/* Frame 2: Historial de Compras */}
        <Link
          to="/historial-compras"
          className="group bg-gray-800 hover:bg-gray-700 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center transition-transform transform hover:scale-105"
        >
          <History className="w-16 h-16 mb-4 text-green-400 group-hover:animate-pulse" />
          <h2 className="text-2xl font-semibold mb-2">Historial de Compras</h2>
          <p className="text-gray-300 text-sm">
            Consulta todas las compras registradas y su estado.
          </p>
        </Link>

        {/* Frame 3: Gestión de Proveedores */}
        <Link
          to="/gestion-proveedores"
          className="group bg-gray-800 hover:bg-gray-700 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center transition-transform transform hover:scale-105"
        >
          <Truck className="w-16 h-16 mb-4 text-blue-400 group-hover:animate-pulse" />
          <h2 className="text-2xl font-semibold mb-2">Gestión de Proveedores</h2>
          <p className="text-gray-300 text-sm">
            Administra la información de tus proveedores y contactos.
          </p>
        </Link>
      </div>
    </div>
  );
}
