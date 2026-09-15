import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { featuredProject } from "../data/projects";

export function ProjectsPage() {
  return (
    <>
      <section className="page-section project-hero">
        <div className="container">
          <p className="eyebrow">Proyectos</p>
          <h1>Iniciativas para sumar apoyo real</h1>
          <p>
            Sumando Vidas organizará sus campañas en proyectos concretos, medibles y fáciles de
            seguir. El primero será Por Ellos.
          </p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container project-feature-grid">
          <article className="project-feature-card">
            <div>
              <p className="eyebrow">{featuredProject.status}</p>
              <h2>{featuredProject.title}</h2>
              <p>{featuredProject.summary}</p>
              <p>{featuredProject.description}</p>
              <div className="action-row">
                <Link className="button button-primary" to={`/proyectos/${featuredProject.slug}`}>
                  Ver más
                </Link>
                <Link className="button button-secondary" to="/donaciones">
                  Donar
                </Link>
              </div>
            </div>
            <div className="project-mini-stats" aria-label="Resumen del proyecto Por Ellos">
              <article>
                <strong>5</strong>
                <span>Medias maratones</span>
              </article>
              <article>
                <strong>{featuredProject.targetAmount.toLocaleString("es-ES")} €</strong>
                <span>Meta simulada</span>
              </article>
              <article>
                <strong>105,5 km</strong>
                <span>Recorrido solidario</span>
              </article>
            </div>
          </article>
          <article className="project-feature-card project-feature-card--secondary">
            <div>
              <p className="eyebrow">Reto mensual</p>
              <h2>Héroes que suman</h2>
              <p>
                Empresas y personas compiten cada mes para liderar una clasificación solidaria y dejar su huella en la lucha contra el cáncer infantil.
              </p>
              <Link className="button button-primary" to="/proyectos/heroes-que-suman">
                Ver el ranking
              </Link>
            </div>
            <div className="project-mini-stats" aria-label="Resumen del proyecto Héroes que suman">
              <article>
                <strong>2</strong>
                <span>Leaderboards mensuales</span>
              </article>
              <article>
                <strong>12</strong>
                <span>Retos al año</span>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="Más proyectos"
            title="Nuevas formas de sumar"
            description="Campañas pensadas para convertir la solidaridad en comunidad, compromiso y ganas de seguir ayudando."
          />
          <div className="card-grid">
            <article className="card">
              <h3>Acompañamiento familiar</h3>
              <p>Proyecto en definición para apoyar a familias durante el diagnóstico y tratamiento.</p>
            </article>
            <article className="card">
              <h3>Ayudas directas</h3>
              <p>Futura línea para necesidades asociadas a desplazamientos, estancia y cuidados.</p>
            </article>
            <article className="card">
              <h3>Bienestar emocional</h3>
              <p>Espacio preparado para recursos y actividades de apoyo emocional.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
