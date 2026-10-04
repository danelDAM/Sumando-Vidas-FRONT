import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicStories } from "../services/publicData";
import { fallbackStories, mergePublicRows } from "../data/publicFallbacks";

export function StoriesPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || "es").split("-")[0];
  const { data, loading, error } = usePublicQuery(`stories:${locale}`, getPublicStories, locale);
  const localizedFallbackStories = fallbackStories.map((story) => {
    if (story.slug === "historia-de-felipe") {
      return {
        ...story,
        title: t("home.storyCards.felipe.title"),
        summary: t("storiesPage.summary"),
        body: t("storiesPage.longDescription"),
        image_alt: t("home.storyCards.felipe.imageAlt"),
      };
    }

    const storyKey = story.slug === "familia-acompanada" ? "family" : "challenges";
    return {
      ...story,
      title: t(`home.storyCards.${storyKey}.title`),
      summary: t(`home.storyCards.${storyKey}.description`),
      image_alt: t(`home.storyCards.${storyKey}.imageAlt`),
    };
  });
  const stories = mergePublicRows(data, localizedFallbackStories, (story) => story.slug);
  const [featuredStory, ...moreStories] = stories;

  return (
    <>
      <section className="page-section page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">{t("storiesPage.eyebrow")}</p>
          <h1>{t("storiesPage.title")}</h1>
          <p>{t("storiesPage.description")}</p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container project-feature-grid">
          {(loading || error) && <PublicDataStatus loading={loading} error={error ? "No se pudieron actualizar las historias; mostramos la historia disponible." : null} empty={false} />}
          {featuredStory && <article className="project-feature-card story-feature-card">
            <div className="story-feature-copy">
              <p className="eyebrow">{t("storiesPage.featured")}</p>
              <h2>{featuredStory.title}</h2>
              {featuredStory.summary && <p>{featuredStory.summary}</p>}
              {featuredStory.body && (
                <details className="story-expander">
                  <summary>{t("storiesPage.readMore")}</summary>
                  <p>{featuredStory.body}</p>
                </details>
              )}
              <div className="action-row">
                <Link className="button button-primary" to="/historias">
                  {t("storiesPage.readHistory")}
                </Link>
                <Link className="button button-secondary" to="/donaciones">
                  {t("storiesPage.support")}
                </Link>
              </div>
            </div>

            <div className="story-feature-media" aria-label={featuredStory.image_alt ?? featuredStory.title}>
              <div className="story-image-placeholder">
                {featuredStory.image_url ? (
                  <img src={featuredStory.image_url} alt={featuredStory.image_alt ?? featuredStory.title} />
                ) : (
                  t("storiesPage.photoFounder")
                )}
              </div>
            </div>
          </article>}
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow={t("storiesPage.moreStories")}
            title={t("storiesPage.titleMore")}
            description={t("storiesPage.descriptionMore")}
          />

          {moreStories.length > 0 && <div className="card-grid">
            {moreStories.map((story) => (
              <article key={story.id} className="card">
                <h3>{story.title}</h3>
                {story.summary && <p>{story.summary}</p>}
                {story.body && (
                  <details className="story-expander">
                    <summary>{t("common.readMore")}</summary>
                    <p>{story.body}</p>
                  </details>
                )}
                <Link className="card-link" to="/historias">{t("common.readMore")}</Link>
              </article>
            ))}
          </div>}
        </div>
      </section>
    </>
  );
}
