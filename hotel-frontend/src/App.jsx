import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Habitaciones from "./pages/habitaciones";
import Reservas from "./pages/reservas";
import Consultas from "./pages/Consultas";
import Mapa from "./pages/mapa";
import Admin from "./pages/Admin";
import Login from "./pages/login";
import AdminHabitaciones from "./pages/AdminHabitaciones";
import NotFound from "./pages/NotFount";
import Home from "./pages/home";
import Adminhabitaciones from "./pages/AdminHabitaciones";
import PrivateRoute from "./components/PrivateRoute";
import Nav from "./components/navbar";
//el nav y footer se muestran en todas las panrtallas, modificar eso para que solo se muestre en algunas
function App() {
  return (
    
    <Router>
      <Nav/>
      <Routes>
        {/*rutas publicas */}
          <Route path="/home" element={<Home />} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/" element={<Home />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/AdminHabitaciones" element={<Adminhabitaciones />} />
          <Route path="*" element={<NotFound />} />


      </Routes>
    </Router>
  );
}

export default App;
