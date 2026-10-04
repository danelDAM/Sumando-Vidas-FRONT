import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SponsorCarousel } from "../components/ui/SponsorCarousel";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicHomeData } from "../services/publicData";

function formatEventDate(date: string | null, locale: string, fallback: string) {
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

function formatMetricValue(value: number, unit: string, locale: string) {
  if (unit === "EUR") {
    return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  }

  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return unit === "count" ? formatted : `${formatted} ${unit}`;
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || "es").split("-")[0];
  const { data, loading, error } = usePublicQuery(`home:${locale}`, getPublicHomeData, locale);
  const projects = data?.projects ?? [];
  const stories = data?.stories ?? [];
  const events = data?.events ?? [];
  const metrics = (data?.metrics ?? []).filter(
    (metric, index, allMetrics) => allMetrics.findIndex((item) => item.metric_key === metric.metric_key) === index,
  );

  const collaborationOptions = [
    {
      title: t("home.cards.donations.title"),
      description: t("home.cards.donations.description"),
      href: "/donaciones",
    },
    {
      title: t("home.cards.join.title"),
      description: t("home.cards.join.description"),
      href: "/donaciones",
    },
    {
      title: t("home.cards.events.title"),
      description: t("home.cards.events.description"),
      href: "/eventos",
    },
    {
      title: t("home.cards.companies.title"),
      description: t("home.cards.companies.description"),
      href: "/voluntariado",
    },
  ];

  const transparencyLinks = [
    { label: t("home.transparency.annualMemory"), href: "/transparencia" },
    { label: t("home.transparency.economicReports"), href: "/transparencia" },
    { label: t("home.transparency.donationDestination"), href: "/transparencia" },
  ];

  return (
    <>
      <section className="hero-section">
        <video
          className="hero-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/niñaCancerPaginaInicio.png"
          aria-hidden="true"
          src="/videos/hero-background.mp4"
        />
        <div className="hero-video-wash" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{t("home.hero.eyebrow")}</p>
            <h1>{t("home.hero.title")}</h1>
            <div className="action-row">
              <Link className="button button-primary" to="/donaciones">
                {t("home.hero.donate")}
              </Link>
              <Link className="button button-secondary" to="/voluntariado">
                {t("home.hero.collaborate")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {data?.sponsors.length ? <SponsorCarousel sponsors={data.sponsors} /> : null}

      <div className="home-ribbon-stage">
        <div className="home-gold-ribbon-background" aria-hidden="true">
          <span className="gold-ribbon-mark gold-ribbon-mark-1" />
          <span className="gold-ribbon-mark gold-ribbon-mark-2" />
          <span className="gold-ribbon-mark gold-ribbon-mark-3" />
          <span className="gold-ribbon-mark gold-ribbon-mark-4" />
          <span className="gold-ribbon-mark gold-ribbon-mark-5" />
        </div>

        {(loading || error) && (
          <section className="page-section">
            <div className="container">
              <PublicDataStatus loading={loading} error={error} empty={false} />
            </div>
          </section>
        )}

        <section className="page-section reveal-group" id="quienes-somos" data-reveal>
          <div className="container split-section">
            <SectionHeader
              eyebrow={t("home.whoWeAre.eyebrow")}
              title={t("home.whoWeAre.title")}
              description={t("home.whoWeAre.description")}
            />
            <div className="content-stack">
              <p>{t("home.whoWeAre.text1")}</p>
              <p>{t("home.whoWeAre.text2")}</p>
              <Link className="text-link" to="/nuestra-historia">
                {t("home.whoWeAre.cta")}
              </Link>
            </div>
          </div>
        </section>

        <section className="page-section reveal-group" id="que-hacemos" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.whatWeDo.eyebrow")}
              title={t("home.whatWeDo.title")}
              description={t("home.whatWeDo.description")}
            />
            <div className="card-grid">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  title={project.title}
                  description={project.summary ?? project.description ?? undefined}
                  href={`/proyectos/${project.slug}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="page-section reveal-group" id="historias" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.stories.eyebrow")}
              title={t("home.stories.title")}
              description={t("home.stories.description")}
            />
            <div className="card-grid">
              {stories.slice(0, 3).map((story) => (
                <Card key={story.id} title={story.title} description={story.summary ?? undefined} href="/historias">
                  <div className="story-image-placeholder" aria-label={story.image_alt ?? story.title}>
                    {story.image_url ? <img src={story.image_url} alt={story.image_alt ?? story.title} /> : t("home.stories.placeholder")}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {metrics.length > 0 && <section className="page-section reveal-group" id="impacto" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.impact.eyebrow")}
              title={t("home.impact.title")}
              description={t("home.impact.description")}
            />
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <article className="metric" key={metric.id}>
                  <strong>{formatMetricValue(metric.value, metric.unit, locale)}</strong>
                  <span>{metric.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>}

        <section className="page-section reveal-group" id="colaborar" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.collaborate.eyebrow")}
              title={t("home.collaborate.title")}
              description={t("home.collaborate.description")}
            />
            <div className="card-grid four-columns">
              {collaborationOptions.map((option) => (
                <Card key={option.title} {...option} />
              ))}
            </div>
          </div>
        </section>

        {events.length > 0 && <section className="page-section reveal-group" id="eventos" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.events.eyebrow")}
              title={t("home.events.title")}
              description={t("home.events.description")}
            />
            <div className="card-grid">
              {events.slice(0, 6).map((event) => (
                <Card
                  key={event.id}
                  title={event.title}
                  href="/eventos"
                  meta={formatEventDate(event.starts_on, locale, "Fecha por confirmar")}
                >
                  <p>{event.city}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>}

        <section className="page-section reveal-group" id="transparencia" data-reveal>
          <div className="container split-section">
            <SectionHeader
              eyebrow={t("home.transparency.eyebrow")}
              title={t("home.transparency.title")}
              description={t("home.transparency.description")}
            />
            <div className="content-stack">
              <p>{t("home.transparency.text")}</p>
              <div className="link-list">
                {transparencyLinks.map((item) => (
                  <Link key={item.label} to={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta reveal-group" data-reveal>
          <div className="container final-cta-content">
            <h2>{t("home.cta.title")}</h2>
            <p>{t("home.cta.description")}</p>
            <div className="action-row">
              <Link className="button button-primary" to="/donaciones">
                {t("common.donate")}
              </Link>
              <Link className="button button-secondary" to="/voluntariado">
                {t("common.collaborate")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
