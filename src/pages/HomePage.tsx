import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SponsorCarousel } from "../components/ui/SponsorCarousel";

export function HomePage() {
  const { t } = useTranslation();

  const programs = [
    {
      title: t("home.programs.porEllos.title"),
      description: t("home.programs.porEllos.description"),
      href: "/proyectos/por-ellos",
    },
    {
      title: t("home.programs.familySupport.title"),
      description: t("home.programs.familySupport.description"),
      href: "/proyectos",
    },
    {
      title: t("home.programs.directAid.title"),
      description: t("home.programs.directAid.description"),
      href: "/proyectos",
    },
  ];

  const stories = [
    {
      title: t("home.storyCards.felipe.title"),
      description: t("home.storyCards.felipe.description"),
      imageAlt: t("home.storyCards.felipe.imageAlt"),
      image: "/images/fotoFelipeMedina.png",
      href: "/historias",
    },
    {
      title: t("home.storyCards.family.title"),
      description: t("home.storyCards.family.description"),
      imageAlt: t("home.storyCards.family.imageAlt"),
      href: "/historias",
    },
    {
      title: t("home.storyCards.challenges.title"),
      description: t("home.storyCards.challenges.description"),
      imageAlt: t("home.storyCards.challenges.imageAlt"),
      href: "/historias",
    },
  ];

  const impactMetrics = [
    { value: "000", label: t("home.impact.families") },
    { value: "000", label: t("home.impact.scholarships") },
    { value: "000", label: t("home.impact.volunteers") },
    { value: "000", label: t("home.impact.events") },
  ];

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

  const events = [
    {
      date: t("home.eventsList.dateValencia"),
      title: t("home.eventsList.valencia"),
      location: t("home.eventsList.locationValencia"),
      href: "/eventos",
    },
    {
      date: t("home.eventsList.dateDonosti"),
      title: t("home.eventsList.donosti"),
      location: t("home.eventsList.locationDonosti"),
      href: "/eventos",
    },
    {
      date: t("home.eventsList.dateSevilla"),
      title: t("home.eventsList.sevilla"),
      location: t("home.eventsList.locationSevilla"),
      href: "/eventos",
    },
    {
      date: t("home.eventsList.dateBarcelona"),
      title: t("home.eventsList.barcelona"),
      location: t("home.eventsList.locationBarcelona"),
      href: "/eventos",
    },
    {
      date: t("home.eventsList.dateMalaga"),
      title: t("home.eventsList.malaga"),
      location: t("home.eventsList.locationMalaga"),
      href: "/eventos",
    },
    {
      date: t("home.eventsList.dateMadrid"),
      title: t("home.eventsList.madrid"),
      location: t("home.eventsList.locationMadrid"),
      href: "/eventos",
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

      <SponsorCarousel />

      <div className="home-ribbon-stage">
        <div className="home-gold-ribbon-background" aria-hidden="true">
          <span className="gold-ribbon-mark gold-ribbon-mark-1" />
          <span className="gold-ribbon-mark gold-ribbon-mark-2" />
          <span className="gold-ribbon-mark gold-ribbon-mark-3" />
          <span className="gold-ribbon-mark gold-ribbon-mark-4" />
          <span className="gold-ribbon-mark gold-ribbon-mark-5" />
        </div>

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
              {programs.map((program) => (
                <Card key={program.title} {...program} />
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
              {stories.map((story) => (
                <Card key={story.title} title={story.title} description={story.description} href={story.href}>
                  <div className="story-image-placeholder" aria-label={story.imageAlt}>
                    {story.image ? <img src={story.image} alt={story.imageAlt} /> : t("home.stories.placeholder")}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section reveal-group" id="impacto" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.impact.eyebrow")}
              title={t("home.impact.title")}
              description={t("home.impact.description")}
            />
            <div className="metrics-grid">
              {impactMetrics.map((metric) => (
                <article className="metric" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

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

        <section className="page-section reveal-group" id="eventos" data-reveal>
          <div className="container">
            <SectionHeader
              eyebrow={t("home.events.eyebrow")}
              title={t("home.events.title")}
              description={t("home.events.description")}
            />
            <div className="card-grid">
              {events.map((event) => (
                <Card key={event.title} title={event.title} href={event.href} meta={event.date}>
                  <p>{event.location}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

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
