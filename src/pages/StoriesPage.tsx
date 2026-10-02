import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";

export function StoriesPage() {
  const { t } = useTranslation();

  const featuredStory = {
    title: t("home.storyCards.felipe.title"),
    description: t("storiesPage.summary"),
    imageAlt: t("home.storyCards.felipe.imageAlt"),
    image: "/images/fotoFelipeMedina.png",
    href: "/historias",
  };

  const moreStories = [
    {
      title: t("home.storyCards.family.title"),
      description: t("home.storyCards.family.description"),
      href: "/historias",
    },
    {
      title: t("home.storyCards.challenges.title"),
      description: t("home.storyCards.challenges.description"),
      href: "/historias",
    },
  ];

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
          <article className="project-feature-card story-feature-card">
            <div className="story-feature-copy">
              <p className="eyebrow">{t("storiesPage.featured")}</p>
              <h2>{featuredStory.title}</h2>
              <p>{t("storiesPage.summary")}</p>
              <details className="story-expander">
                <summary>{t("storiesPage.readMore")}</summary>
                <p>{t("storiesPage.longDescription")}</p>
              </details>
              <div className="action-row">
                <Link className="button button-primary" to={featuredStory.href}>
                  {t("storiesPage.readHistory")}
                </Link>
                <Link className="button button-secondary" to="/donaciones">
                  {t("storiesPage.support")}
                </Link>
              </div>
            </div>

            <div className="story-feature-media" aria-label={featuredStory.imageAlt}>
              <div className="story-image-placeholder">
                {featuredStory.image ? (
                  <img src={featuredStory.image} alt={featuredStory.imageAlt} />
                ) : (
                  t("storiesPage.photoFounder")
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow={t("storiesPage.moreStories")}
            title={t("storiesPage.titleMore")}
            description={t("storiesPage.descriptionMore")}
          />

          <div className="card-grid">
            {moreStories.map((story) => (
              <article key={story.title} className="card">
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <Link className="card-link" to={story.href}>
                  {t("common.readMore")}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
