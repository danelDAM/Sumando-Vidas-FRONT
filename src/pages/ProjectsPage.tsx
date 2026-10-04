import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicProjects } from "../services/publicData";
import { fallbackCampaigns, fallbackProjects, mergePublicRows } from "../data/publicFallbacks";

export function ProjectsPage() {
  const { t } = useTranslation();
  const { data, loading, error } = usePublicQuery("projects", getPublicProjects, null);
  const projects = mergePublicRows(data?.projects, fallbackProjects, (project) => project.slug);
  const campaigns = mergePublicRows(data?.campaigns, fallbackCampaigns, (campaign) => campaign.slug);

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
          {(loading || error) && <PublicDataStatus loading={loading} error={error ? "No se pudieron actualizar los proyectos; mostramos la información disponible." : null} empty={false} />}
          {projects.map((project) => {
            const campaign = campaigns.find((item) => item.project_id === project.id || item.slug === project.slug);
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
              <p>{t("projects.category.familyDescription")}</p>
            </article>
            <article className="card">
              <h3>{t("projects.category.aid")}</h3>
              <p>{t("projects.category.aidDescription")}</p>
            </article>
            <article className="card">
              <h3>{t("projects.category.wellbeing")}</h3>
              <p>{t("projects.category.wellbeingDescription")}</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
