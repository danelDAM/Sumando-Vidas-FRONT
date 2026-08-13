import { Link } from "react-router-dom";
import { legalNavigation, mainNavigation } from "../../data/navigation";
import { Logo } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Asociación española de apoyo a niños y familias afectados por el cáncer infantil.</p>
        </div>
        <nav aria-label="Enlaces principales">
          <h2>Secciones</h2>
          {mainNavigation.map((item) => (
            <Link key={item.href} to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Redes sociales">
          <h2>Redes</h2>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
        <address>
          <h2>Contacto</h2>
          <a href="mailto:info@sumandovidas.org">info@sumandovidas.org</a>
          <a href="tel:+34000000000">+34 000 000 000</a>
          <span>España</span>
        </address>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Sumando Vidas</span>
        <nav aria-label="Información legal">
          {legalNavigation.map((item) => (
            <Link key={item.href} to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
