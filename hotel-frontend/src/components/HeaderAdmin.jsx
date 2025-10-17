/////HEADER PARA ADMINISTRADORES

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const hotelImages = [
  "/assets/piscina del hotel.png",
  "/assets/carrusel1.png",
  "/assets/carrusel2.png",
  "/assets/carrusel3.png",
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/habitaciones", label: "Habitaciones" },
  { href: "/reservas", label: "Reservas" },
  { href: "/consultas", label: "Consultas" },
  { href: "/admin", label: "Administración" },
];

export default function HotelHeader() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Chequea si hay sesión activa
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="relative h-[70vh] min-h-[500px] overflow-hidden">
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

      {/* Navegación */}
      <nav
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="font-serif text-2xl font-light tracking-wider text-white">
                Hotel M&L
              </span>
            </Link>

            {/* Navegación desktop */}
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-sans text-sm font-light tracking-wide text-white/90 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}

              {/* Botón Login o Cerrar sesión */}
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="border border-white/30 bg-transparent text-white font-light px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="border border-white/30 bg-transparent text-white font-light px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 backdrop-blur-md md:hidden">
            <div className="space-y-1 px-4 pb-6 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block py-3 font-sans text-base font-light text-white/90 transition-colors hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!isLoggedIn ? (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 block w-full border border-white/30 bg-transparent text-white font-light px-4 py-2 rounded-lg text-center hover:bg-white hover:text-black transition"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-4 w-full border border-white/30 bg-transparent text-white font-light px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Contenido central */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-white sm:text-6xl lg:text-7xl">
            Bienvenido a la
            <br />
            <span className="font-normal">Experiencia Perfecta</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg font-light leading-relaxed text-white/90 sm:text-xl">
            Descubre el lujo y la comodidad en cada detalle de nuestro hotel
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/reservas"
              className="bg-white text-black font-sans font-normal px-6 py-3 rounded-lg hover:bg-white/90 transition"
            >
              Reservar Ahora
            </Link>
            <Link
              to="/habitaciones"
              className="border border-white/30 bg-transparent text-white font-sans font-light px-6 py-3 rounded-lg hover:bg-white hover:text-black transition"
            >
              Ver Habitaciones
            </Link>
          </div>
        </div>
      </div>

      {/* Indicadores del carrusel */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {hotelImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? "w-8 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir a la imagen ${index + 1}`}
          />
        ))}
      </div>
    </header>
  );
}
