import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { mainNavigation } from "../../data/navigation";
import { Logo } from "../ui/Logo";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <div className="container header-content">
        <Link className="brand-link" to="/" aria-label="Sumando Vidas, inicio">
          <Logo />
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="navegacion-principal"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
        </button>
        <nav
          className={`main-nav ${isMenuOpen ? "is-open" : ""}`}
          id="navegacion-principal"
          aria-label="Navegación principal"
        >
          {mainNavigation.filter((item) => item.label !== "Transparencia").map((item) => (
            <NavLink key={item.href} to={item.href} onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link className="button button-primary header-donate-button" to="/donaciones" onClick={closeMenu}>
          Donar
        </Link>
      </div>
    </header>
  );
}
