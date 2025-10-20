import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "../back_supabase/Client";

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

  // Sincroniza sesión Supabase y cambios en otras pestañas
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      // Guardamos en localStorage para detectar cambios en otras pestañas
      localStorage.setItem("isLoggedIn", !!data.session);
    };
    checkSession();

    // Escucha cambios de sesión en esta pestaña
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      localStorage.setItem("isLoggedIn", !!session);
    });

    // Escucha cambios de localStorage (cerrar sesión en otra pestaña)
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn") {
        setIsLoggedIn(e.newValue === "true");
      }
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
    localStorage.setItem("isLoggedIn", "false"); // sincroniza otras pestañas
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
