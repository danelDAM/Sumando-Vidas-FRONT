import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";
import { collaborators, founders, teamMembers, type PersonProfile } from "../data/people";

// Follows the mouse with a small 3D tilt; CSS disables it on touch and reduced motion.
function handleTilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") {
    return;
  }

  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  event.currentTarget.style.setProperty("--tilt-x", `${((0.5 - y) * 10).toFixed(2)}deg`);
  event.currentTarget.style.setProperty("--tilt-y", `${((x - 0.5) * 12).toFixed(2)}deg`);
  event.currentTarget.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
  event.currentTarget.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
}

function resetTilt(event: PointerEvent<HTMLElement>) {
  ["--tilt-x", "--tilt-y"].forEach((property) => event.currentTarget.style.removeProperty(property));
}

function PersonInitial({ name, className }: { name: string; className: string }) {
  return <span className={className} aria-hidden="true">{name.slice(0, 1)}</span>;
}

type PeopleSectionProps = {
  eyebrow: string;
  title: string;
  people: PersonProfile[];
  emptyMessage: string;
  className?: string;
};

function PeopleSection({ eyebrow, title, people, emptyMessage, className = "" }: PeopleSectionProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (index: number) => setOpenIndex((current) => (current === index ? null : index));
  const toggleWithKey = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(index);
    }
  };

  return (
    <section className={`page-section about-people-section reveal-group ${className}`} data-reveal>
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="about-member-grid">
          {people.length > 0 ? (
            people.map((person, index) => (
              <article
                className={`about-member ${person.bioKey ? "has-bio" : ""} ${openIndex === index ? "is-open" : ""}`}
                key={`${person.name}-${index}`}
                tabIndex={0}
                role={person.bioKey ? "button" : undefined}
                aria-expanded={person.bioKey ? openIndex === index : undefined}
                onClick={person.bioKey ? () => toggle(index) : undefined}
                onKeyDown={person.bioKey ? (event) => toggleWithKey(event, index) : undefined}
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
              >
                {person.image ? (
                  <img src={person.image} alt={person.imageAltKey ? t(person.imageAltKey) : ""} loading="lazy" />
                ) : (
                  <PersonInitial name={person.name} className="about-member-initial" />
                )}
                <span className="about-member-role">{t(person.roleKey)}</span>
                {person.bioKey && <span className="about-member-toggle" aria-hidden="true">+</span>}
                <div className="about-member-copy">
                  <h3>{person.name}</h3>
                  {person.bioKey && <p>{t(person.bioKey)}</p>}
                </div>
              </article>
            ))
          ) : (
            <>
              <div className="about-member-empty">
                <p>{emptyMessage}</p>
                <strong>{t("aboutPage.joinTitle")}</strong>
                <Link className="button button-primary" to="/contacto">
                  {t("nav.contact")}
                </Link>
              </div>
              <div className="about-member-ghost" aria-hidden="true" />
              <div className="about-member-ghost" aria-hidden="true" />
              <div className="about-member-ghost" aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  const { t } = useTranslation();
  const peopleWithPhotos = [...founders, ...teamMembers, ...collaborators].filter((person) => person.image);

  return (
    <>
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div className="about-hero-copy">
            <p className="eyebrow">{t("home.whoWeAre.eyebrow")}</p>
            <h1>{t("aboutPage.title")}</h1>
            <p>{t("home.whoWeAre.description")}</p>
          </div>
          <div className="about-hero-faces" aria-hidden="true">
            {peopleWithPhotos.map((person, index) => (
              <img
                key={person.name}
                src={person.image}
                alt=""
                style={{ "--face-index": index } as CSSProperties}
              />
            ))}
            <span className="about-hero-face-placeholder">+</span>
          </div>
        </div>
      </section>

      <section className="page-section about-founders reveal-group" data-reveal>
        <div className="container">
          <SectionHeader eyebrow={t("aboutPage.origin")} title={t("aboutPage.founders")} />
          {founders.length > 0 ? (
            founders.map((person, index) => (
              <article className="about-founder" key={person.name}>
                <div className="about-founder-portrait" onPointerMove={handleTilt} onPointerLeave={resetTilt}>
                  <span className="about-founder-portrait-role" aria-hidden="true">{t(person.roleKey)}</span>
                  <div className="about-founder-frame">
                    {person.image ? (
                      <img src={person.image} alt={person.imageAltKey ? t(person.imageAltKey) : ""} />
                    ) : (
                      <PersonInitial name={person.name} className="about-member-initial" />
                    )}
                  </div>
                </div>
                <div className="about-founder-copy">
                  <span className="about-founder-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="about-role-pill">{t(person.roleKey)}</span>
                  <h3>{person.name}</h3>
                  {person.bioKey && <p>{t(person.bioKey)}</p>}
                  <Link className="text-link" to="/historias">
                    {t("common.readStory")}
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <p className="about-member-empty">{t("aboutPage.profilesComing")}</p>
          )}
        </div>
      </section>

      <PeopleSection
        eyebrow={t("aboutPage.dailyWork")}
        title={t("aboutPage.team")}
        people={teamMembers}
        emptyMessage={t("aboutPage.teamDescription")}
        className="about-people-section--tinted"
      />
      <PeopleSection
        eyebrow={t("aboutPage.community")}
        title={t("aboutPage.collaborators")}
        people={collaborators}
        emptyMessage={t("aboutPage.collaboratorsDescription")}
      />
    </>
  );
}
