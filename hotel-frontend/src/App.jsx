import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/footer";
import Habitaciones from "./pages/habitaciones";
import Servicios from "./pages/servicios";
import Reservas from "./pages/reservas";
import Consultas from "./pages/consultas";
import Mapa from "./pages/mapa";
import Admin from "./pages/Admin";
import Login from "./pages/login";
import AdminHabitaciones from "./pages/AdminHabitaciones";
import NotFound from "./pages/NotFount";
import Home from "./pages/home";

//el nav y footer se muestran en todas las panrtallas, modificar eso para que solo se muestre en algunas
function App() {
  return (
    
    <Router>
      <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/habitaciones" element={<AdminHabitaciones />} />
          <Route path="*" element={<NotFound />} />

      </Routes>
      <Footer />
    </Router>
  );
}
/*
*/      

export default App;
