import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Habitaciones from "./pages/habitaciones";
import Servicios from "./pages/servicios";
import Reservas from "./pages/reservas";
import Consultas from "./pages/consultas";
import Mapa from "./pages/mapa";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Habitaciones />} />
        <Route path="/habitaciones" element={<Habitaciones />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
