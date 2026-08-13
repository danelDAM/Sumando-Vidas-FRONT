import { Link, NavLink } from "react-router-dom";
import { mainNavigation } from "../../data/navigation";
import { Logo } from "../ui/Logo";

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <div className="container header-content">
        <Link className="brand-link" to="/" aria-label="Por Ellos, inicio">
          <Logo />
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          {mainNavigation.map((item) => (
            <NavLink key={item.href} to={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link className="button button-primary" to="/donaciones">
          Donar
        </Link>
      </div>
    </header>
  );
}
