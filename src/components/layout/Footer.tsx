import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { legalNavigation, mainNavigation } from "../../data/navigation";
import { Logo } from "../ui/Logo";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{t("footer.description")}</p>
        </div>
        <nav aria-label={t("footer.sections")}>
          <h2>{t("footer.sections")}</h2>
          {mainNavigation.map((item) => (
            <Link key={item.href} to={item.href}>
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <nav aria-label={t("footer.social")}>
          <h2>{t("footer.social")}</h2>
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
          <h2>{t("footer.contact")}</h2>
          <a href="mailto:info@sumandovidas.org">{t("footer.email")}</a>
          <a href="tel:+34000000000">{t("footer.phone")}</a>
          <span>{t("footer.country")}</span>
        </address>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Sumando Vidas</span>
        <nav aria-label={t("footer.legal")}>
          {legalNavigation.map((item) => (
            <Link key={item.href} to={item.href}>
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
