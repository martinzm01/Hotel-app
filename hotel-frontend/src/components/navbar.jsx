import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function HotelNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { session, profile, logout } = useAuth();

  // 1. Definimos las clases de estilo una sola vez para reutilizarlas
  const desktopLinkClasses = "font-sans text-sm font-light tracking-wide text-white/90 transition-colors hover:text-white";
  const mobileLinkClasses = "block py-3 font-sans text-base font-light text-white/90 transition-colors hover:text-white";
  const authButtonClasses = "border border-white/30 bg-transparent text-white font-light px-4 py-2 rounded-lg hover:bg-white hover:text-black transition";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const closeMenu = () => setIsMenuOpen(false);

  // 2. Lógica de enlaces simplificada para mayor claridad
  const getNavLinks = () => {
    const links = [
      { href: "/home", label: "Home", roles: ["cliente", "administrador", "publico"] }
    ];

    if (!session) { // No logueado
      links.push({ href: "/habitaciones", label: "Habitaciones", roles: ["publico"] });
    } else if (profile?.rol === 'cliente') { // Cliente
      links.push(
        { href: "/habitaciones", label: "Habitaciones", roles: ["cliente"] },
        { href: "/reservas", label: "Reservas", roles: ["cliente"] },
        { href: "/consultas", label: "Consultas", roles: ["cliente"] }
      );
    } else if (profile?.rol === 'administrador') { // Admin
      links.push({ href: "/admin", label: "Administración", roles: ["administrador"] });
    }
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="font-serif text-2xl font-light tracking-wider text-white">Hotel M&L</span>
          </Link>

          {/* Navegación desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className={desktopLinkClasses}>
                {link.label}
              </Link>
            ))}
            {!session ? (
              <Link to="/login" className={authButtonClasses}>Login</Link>
            ) : (
              <button onClick={handleLogout} className={authButtonClasses}>Cerrar Sesión</button>
            )}
          </div>

          {/* Botón menú móvil */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white md:hidden" aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil (Simplificado) */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-black/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {/* 3. Simplemente volvemos a renderizar los enlaces con las clases de móvil */}
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className={mobileLinkClasses} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              {!session ? (
                <Link to="/login" className={`${authButtonClasses} block w-full text-center`} onClick={closeMenu}>Login</Link>
              ) : (
                <button onClick={() => { handleLogout(); closeMenu(); }} className={`${authButtonClasses} block w-full`}>Cerrar Sesión</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
