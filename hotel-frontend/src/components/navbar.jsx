import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "../back_supabase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/habitaciones", label: "Habitaciones" },
  { href: "/reservas", label: "Reservas" },
  { href: "/consultas", label: "Consultas" },
  { href: "/admin", label: "Administración" },
];

export default function HotelNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sincroniza sesión Supabase
  useEffect(() => {
    // Obtiene sesión actual
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    getSession();

    // Escucha cambios de sesión en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
  );
}
