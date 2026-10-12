import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import { mainNavigation } from "../../data/navigation";
import { Logo } from "../ui/Logo";

export function Header() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = useLocation().pathname === "/";
  const languageMenuRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setIsMenuOpen(false);
  const languageOptions = [
    { code: "es", label: "ES", name: "Español" },
    { code: "eu", label: "EU", name: "Euskera" },
    { code: "ca", label: "CA", name: "Català" },
  ];
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "es";

  useEffect(() => {
    if (!isHome) {
      return undefined;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLanguageMenuOpen]);

  return (
    <header
      className={`site-header ${isHome ? "site-header--over-hero" : ""} ${isHome && !isScrolled && !isMenuOpen ? "is-transparent" : ""}`}
    >
      <a className="skip-link" href="#contenido-principal">
        {t("common.skipContent")}
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
          aria-label={isMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
        </button>
        <nav
          className={`main-nav ${isMenuOpen ? "is-open" : ""}`}
          id="navegacion-principal"
          aria-label="Navegación principal"
        >
          {mainNavigation.map((item) => (
            <NavLink key={item.href} to={item.href} onClick={closeMenu}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <div className="language-switcher-wrapper" ref={languageMenuRef}>
            <button
              type="button"
              className="language-switcher"
              aria-label={t("common.language")}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsLanguageMenuOpen((open) => !open)}
            >
              <span>{languageOptions.find((option) => option.code === currentLanguage)?.label ?? "ES"}</span>
              <span className={`language-chevron ${isLanguageMenuOpen ? "is-open" : ""}`} aria-hidden="true">
                ▾
              </span>
            </button>
            {isLanguageMenuOpen && (
              <div className="language-menu" role="menu" aria-label={t("common.language")}>
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className={`language-option ${option.code === currentLanguage ? "is-selected" : ""}`}
                    role="menuitemradio"
                    aria-checked={option.code === currentLanguage}
                    onClick={() => {
                      i18n.changeLanguage(option.code);
                      setIsLanguageMenuOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    <small>{option.name}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link className="button button-primary header-donate-button" to="/donaciones" onClick={closeMenu}>
            {t("common.donate")}
          </Link>
        </div>
      </div>
    </header>
  );
}
