import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicProjects } from "../services/publicData";

export function ProjectsPage() {
  const { t } = useTranslation();
  const { data, loading, error } = usePublicQuery("projects", getPublicProjects, null);

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
          <PublicDataStatus
            loading={loading}
            error={error}
            empty={!loading && !error && (data?.projects.length ?? 0) === 0}
            emptyMessage="Todavía no hay proyectos publicados."
          />
          {data?.projects.map((project) => {
            const campaign = data.campaigns.find((item) => item.project_id === project.id);
            const campaignGoal = campaign?.goal_amount == null
              ? null
              : new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: campaign.currency,
                  maximumFractionDigits: 0,
                }).format(campaign.goal_amount);

            return (
              <article className="project-feature-card" key={project.id}>
                <div>
                  <h2>{project.title}</h2>
                  {project.summary && <p>{project.summary}</p>}
                  {project.description && <p>{project.description}</p>}
                  <div className="action-row">
                    <Link className="button button-primary" to={`/proyectos/${project.slug}`}>
                      {t("projects.featured.cta")}
                    </Link>
                    <Link className="button button-secondary" to="/donaciones">
                      {t("common.donate")}
                    </Link>
                  </div>
                </div>
                {campaignGoal && (
                  <div className="project-mini-stats" aria-label={`Objetivo de ${campaign?.title}`}>
                    <article>
                      <strong>{campaignGoal}</strong>
                      <span>{t("projects.page.stats.goal")}</span>
                    </article>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
