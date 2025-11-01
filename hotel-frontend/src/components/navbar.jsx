import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; 
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; 
import { Sun, Moon } from "lucide-react";

export default function HotelNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { session, profile, logout } = useAuth();
  const location = useLocation(); // 👈 Detectamos la ruta actual
  const isInAdmin = location.pathname.startsWith("/admin"); // 👈 Detecta si estás en el panel admin

  const desktopLinkClasses =
    "font-sans text-sm font-light tracking-wide text-gray-700 dark:text-white/90 transition-colors hover:text-black dark:hover:text-white";
  const mobileLinkClasses =
    "block py-3 font-sans text-base font-light text-gray-700 dark:text-white/90 transition-colors hover:text-black dark:hover:text-white";
  const authButtonClasses =
    "border border-gray-700/30 text-gray-700 cursor-pointer dark:border-white/30 dark:text-white font-light px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-white hover:text-white dark:hover:text-black transition";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const closeMenu = () => setIsMenuOpen(false);

  // Lógica de enlaces base
  const getNavLinks = () => {
    const links = [{ href: "/home", label: "Home" }];

    if (!session) {
      links.push({ href: "/habitaciones", label: "Habitaciones" });
    } else if (profile?.rol === "cliente") {
      links.push(
        { href: "/habitaciones", label: "Habitaciones" },
        { href: "/consultas", label: "Consultas" },
        { href: "/historialReservas", label: "Reservas" }
      );
    } else if (profile?.rol === "administrador") {
      links.push({ href: "/admin", label: "Administración" }),
      links.push({ href: "/admin/habitaciones", label: "Habitaciones" }),
      links.push({ href: "/admin/operadores", label: "Operadores" },
      );
    } else if (profile?.rol === "operador") {
      links.push(
        { href: "/MenuOperador", label: "Inicio" },
        { href: "/adminconsultas", label: "Consultas" },
        { href: "/mapa", label: "Mapa" },
        { href: "/reservas", label: "Reservas" }
      );
    }
    return links;
  };

  // Filtramos “Home” si estás en el panel admin
  const navLinks = getNavLinks().filter(link => {
    // Ocultar "Home" si es operador o si estás en el panel admin
    if ((profile?.rol === "operador" || isInAdmin) && link.label === "Home") return false;
    return true;
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md"
          : "bg-white dark:bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="font-serif text-2xl font-light tracking-wider text-gray-900 dark:text-white">
              Hotel M&L
            </span>
          </Link>

          {/* Navegación desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className={desktopLinkClasses}>
                {link.label}
              </Link>
            ))}

            {!session ? (
              !isInAdmin && (
                <Link to="/login" className={authButtonClasses}>
                  Login
                </Link>
              )
            ) : (
              <button onClick={handleLogout} className={authButtonClasses}>
                Cerrar Sesión
              </button>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 dark:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="border-t border-gray-300/50 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={mobileLinkClasses}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}

            {/* Botón de Tema móvil */}
            <button
              onClick={() => {
                toggleTheme();
                closeMenu();
              }}
              className={mobileLinkClasses}
              aria-label="Cambiar tema"
            >
              {theme === "light" ? (
                <span className="flex items-center gap-2">
                  <Moon size={18} /> Tema Oscuro
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sun size={18} className="text-yellow-400" /> Tema Claro
                </span>
              )}
            </button>

            <div className="pt-4">
              {!session ? (
                !isInAdmin && (
                  <Link
                    to="/login"
                    className={`${authButtonClasses} block w-full text-center`}
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                )
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className={`${authButtonClasses} block w-full `}
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
