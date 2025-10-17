import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "../back_supabase/client";

const pageContent = {
  "/habitaciones": {
    title: "Nuestras Habitaciones",
    subtitle: "Explora nuestras opciones de alojamiento, diseñadas para ofrecerte el máximo confort y elegancia durante tu estancia",
  },
  "/reservas": {
    title: "Reservas",
    subtitle: "Gestiona tus reservas de manera rápida y sencilla.",
  },
  "/consultas": {
    title: "Consultas",
    subtitle: "¿Tienes dudas? Estamos aquí para ayudarte.",
  },
  "/admin": {
    title: "Panel de Administración",
    subtitle: "Gestiona habitaciones, usuarios y reservas desde un solo lugar.",
  },
  "/login": {
    title: "Iniciar Sesión",
    subtitle: "Accede al panel de administración del hotel.",
  },
};

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
  const location = useLocation();

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

  // Manejo de sesión con Supabase y sincronización entre pestañas
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      localStorage.setItem("isLoggedIn", !!data.session);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      localStorage.setItem("isLoggedIn", !!session);
    });

    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn") setIsLoggedIn(e.newValue === "true");
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    navigate("/login");
  };

  return (
    <header className="relative h-[40vh] max-h-[400px] min-h-[200px] overflow-hidden">
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
            <Link to="/" className="flex items-center">
              <span className="font-serif text-2xl font-light tracking-wider text-white">
                Hotel M&L
              </span>
            </Link>

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

      {/* Contenido central dinámico */}
      <div className="relative z-10 flex min-h-full mt-20 justify-center px-4 text-center">
        <div>
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-white sm:text-6xl lg:text-7xl">
            {pageContent[location.pathname]?.title || "Hotel M&L"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg font-light leading-relaxed text-white/90 sm:text-xl">
            {pageContent[location.pathname]?.subtitle || "Tu experiencia ideal de hospedaje."}
          </p>
        </div>
      </div>
    </header>
  );
}
