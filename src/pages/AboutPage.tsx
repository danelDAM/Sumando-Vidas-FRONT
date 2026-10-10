import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";

type PersonProfile = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  imageAlt?: string;
};

type PeopleGroupProps = {
  eyebrow: string;
  title: string;
  people: PersonProfile[];
  emptyMessage: string;
};

function PeopleGroup({ eyebrow, title, people, emptyMessage }: PeopleGroupProps) {
  return (
    <section className="about-roster-group">
      <header className="about-roster-group-header">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </header>
      {people.length > 0 ? (
        <div className="about-person-list">
          {people.map((person, index) => (
            <article className="about-person" key={`${person.name}-${index}`}>
              <span className="about-person-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {person.image ? (
                <img className="about-person-image" src={person.image} alt={person.imageAlt ?? ""} />
              ) : (
                <div className="about-person-initial" aria-hidden="true">{person.name.slice(0, 1)}</div>
              )}
              <div className="about-person-copy">
                <p className="eyebrow">{person.role}</p>
                <h3>{person.name}</h3>
                <p>{person.bio}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="about-people-empty">{emptyMessage}</p>
      )}
    </section>
  );
}

export function AboutPage() {
  const { t } = useTranslation();
  const founders: PersonProfile[] = [
    {
      name: "Felipe",
      role: t("aboutPage.founderRole"),
      bio: t("storiesPage.summary"),
      image: "/images/fotoFelipeMedina.png",
      imageAlt: t("home.storyCards.felipe.imageAlt"),
    },
  ];
  const teamMembers: PersonProfile[] = [];
  const collaborators: PersonProfile[] = [];

  return (
    <>
      <section className="page-section page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">{t("home.whoWeAre.eyebrow")}</p>
          <h1>{t("home.whoWeAre.title")}</h1>
          <p>{t("home.whoWeAre.description")}</p>
        </div>
      </section>

      <section className="page-section about-directory reveal-group" data-reveal>
        <div className="container">
          <div className="about-directory-intro">
            <SectionHeader
              eyebrow={t("aboutPage.people")}
              title={t("aboutPage.title")}
            />
          </div>
          <PeopleGroup
            eyebrow={t("aboutPage.origin")}
            title={t("aboutPage.founders")}
            people={founders}
            emptyMessage={t("aboutPage.profilesComing")}
          />
          <PeopleGroup
            eyebrow={t("aboutPage.dailyWork")}
            title={t("aboutPage.team")}
            people={teamMembers}
            emptyMessage={t("aboutPage.teamDescription")}
          />
          <PeopleGroup
            eyebrow={t("aboutPage.community")}
            title={t("aboutPage.collaborators")}
            people={collaborators}
            emptyMessage={t("aboutPage.collaboratorsDescription")}
          />
        </div>
      </section>
    </>
  );
}