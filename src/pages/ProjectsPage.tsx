import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";

export function ProjectsPage() {
  const { t } = useTranslation();

  return (
    <>
      <section className="page-section page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">{t("projects.page.eyebrow")}</p>
          <h1>{t("projects.page.title")}</h1>
          <p>{t("projects.page.description")}</p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container project-feature-grid">
          <article className="project-feature-card">
            <div>
              <h2>{t("projects.featured.title")}</h2>
              <p>{t("projects.featured.summary")}</p>
              <p>{t("projects.featured.description")}</p>
              <div className="action-row">
                <Link className="button button-primary" to="/proyectos/por-ellos">
                  {t("projects.featured.cta")}
                </Link>
                <Link className="button button-secondary" to="/donaciones">
                  {t("common.donate")}
                </Link>
              </div>
            </div>
            <div className="project-mini-stats" aria-label="Resumen del proyecto Por Ellos">
              <article>
                <strong>5</strong>
                <span>{t("projects.page.stats.marathons")}</span>
              </article>
              <article>
                <strong>60.000 €</strong>
                <span>{t("projects.page.stats.goal")}</span>
              </article>
              <article>
                <strong>105,5 km</strong>
                <span>{t("projects.page.stats.distance")}</span>
              </article>
            </div>
          </article>
          <article className="project-feature-card project-feature-card--secondary">
            <div>
              <p className="eyebrow">{t("projects.page.stats.monthlyChallenge")}</p>
              <h2>{t("projects.challenges.title")}</h2>
              <p>{t("projects.challenges.description")}</p>
              <Link className="button button-primary" to="/proyectos/heroes-que-suman">
                {t("projects.featured.ranking")}
              </Link>
            </div>
            <div className="project-mini-stats" aria-label="Resumen del proyecto Héroes que suman">
              <article>
                <strong>2</strong>
                <span>{t("projects.page.stats.leaderboards")}</span>
              </article>
              <article>
                <strong>12</strong>
                <span>{t("projects.page.stats.challenges")}</span>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow={t("projects.page.moreProjects.eyebrow")}
            title={t("projects.page.moreProjects.title")}
            description={t("projects.page.moreProjects.description")}
          />
          <div className="card-grid">
            <article className="card">
              <h3>{t("projects.category.family")}</h3>
              <p>Proyecto en definición para apoyar a familias durante el diagnóstico y tratamiento.</p>
            </article>
            <article className="card">
              <h3>{t("projects.category.aid")}</h3>
              <p>Futura línea para necesidades asociadas a desplazamientos, estancia y cuidados.</p>
            </article>
            <article className="card">
              <h3>{t("projects.category.wellbeing")}</h3>
              <p>Espacio preparado para recursos y actividades de apoyo emocional.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
