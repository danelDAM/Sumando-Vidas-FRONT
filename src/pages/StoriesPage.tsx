import { Link } from "react-router-dom";
import { stories } from "../data/homeContent";
import { SectionHeader } from "../components/ui/SectionHeader";

export function StoriesPage() {
  const featuredStory = stories[0];
  const moreStories = stories.slice(1);

  return (
    <>
      <section className="page-section project-hero">
        <div className="container">
          <p className="eyebrow">Historias</p>
          <h1>Historias que dan sentido al camino</h1>
          <p>
            En esta sección recogemos relatos reales que acompañan la misión de la asociación:
            historias de lucha, esperanza, comunidad y apoyo en los momentos más difíciles.
          </p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container project-feature-grid">
          <article className="project-feature-card story-feature-card">
            <div className="story-feature-copy">
              <p className="eyebrow">Historia destacada</p>
              <h2>{featuredStory.title}</h2>
              <p>
                Es el fundador de la asociación, superó un cáncer infantil y ahora quiere terminar
                Medicina para especializarse en oncología infantil y seguir ayudando a otros niños.
              </p>
              <details className="story-expander">
                <summary>Leer más</summary>
                <p>
                  A los 12 años, al malagueño le diagnosticaron un linfoma de no Hodgkin de células
                  T. Estando en la UCI, una amiga le acercó una imagen sagrada a través de una
                  pulsera y una estampa, y desde entonces no se ha separado de ella. Tras superar la
                  enfermedad, decidió estudiar Medicina para poder ayudar a más niños con su misma
                  condición y, mientras cursaba la carrera, fundó la asociación.
                </p>
              </details>
              <div className="action-row">
                <Link className="button button-primary" to={featuredStory.href}>
                  Leer historia
                </Link>
                <Link className="button button-secondary" to="/donaciones">
                  Apoyar la causa
                </Link>
              </div>
            </div>

            <div className="story-feature-media" aria-label={featuredStory.imageAlt}>
              <div className="story-image-placeholder">
                {featuredStory.image ? (
                  <img src={featuredStory.image} alt={featuredStory.imageAlt} />
                ) : (
                  "Foto del fundador"
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="Más historias"
            title="Relatos de esperanza y comunidad"
            description="Cada historia refleja una forma distinta de acompañar, sostener y caminar junto a familias y niños que viven el cáncer infantil."
          />

          <div className="card-grid">
            {moreStories.map((story) => (
              <article key={story.title} className="card">
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <Link className="card-link" to={story.href}>
                  Leer más
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
