import React from 'react';
// Asumo que tienes estos componentes
import HotelNavbar from './components/navbar'; // Corregí la ruta
import AppRoutes from './AppRoutes'; // Importa el nuevo archivo de rutas
// NO necesitas AuthProvider ni Router/BrowserRouter aquí

function App() {
  return (
    <> {/* Puedes usar un Fragment (<>) o un <div> */}
      <HotelNavbar />
      <AppRoutes />
      {/* Footer, etc. si lo tienes */}
    </>
  );
}

export default App; // Asegúrate de exportarlo

