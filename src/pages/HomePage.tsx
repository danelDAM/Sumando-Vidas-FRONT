import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import {
  collaborationOptions,
  events,
  impactMetrics,
  programs,
  stories,
  transparencyLinks,
} from "../data/homeContent";

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Cáncer infantil</p>
            <h1>Acompañamos a niños y familias cuando más lo necesitan</h1>
            <p>
              Por Ellos nace para ofrecer apoyo humano, económico y comunitario a familias
              afectadas por el cáncer infantil en España.
            </p>
            <div className="action-row">
              <Link className="button button-primary" to="/donaciones">
                Donar ahora
              </Link>
              <Link className="button button-secondary" to="/voluntariado">
                Colaborar
              </Link>
            </div>
          </div>
          <div className="media-placeholder" aria-label="Espacio reservado para imagen o vídeo">
            Imagen o vídeo principal
          </div>
        </div>
      </section>

      <section className="page-section" id="quienes-somos">
        <div className="container split-section">
          <SectionHeader
            eyebrow="Quiénes somos"
            title="Una asociación centrada en las familias"
            description="Trabajamos para que ninguna familia se sienta sola durante el proceso de enfermedad."
          />
          <div className="content-stack">
            <p>
              Nuestra misión es acompañar, escuchar y facilitar recursos a niños, madres,
              padres, hermanos y cuidadores durante las distintas etapas del cáncer infantil.
            </p>
            <p>
              Nuestros objetivos combinan apoyo directo, sensibilización social, colaboración
              con entidades y creación de redes de ayuda sostenibles.
            </p>
            <Link className="text-link" to="/nuestra-historia">
              Conocer nuestra historia
            </Link>
          </div>
        </div>
      </section>

      <section className="page-section" id="que-hacemos">
        <div className="container">
          <SectionHeader
            eyebrow="Qué hacemos"
            title="Programas preparados para crecer"
            description="La estructura queda lista para incorporar nuevos proyectos, campañas y líneas de ayuda."
          />
          <div className="card-grid">
            {programs.map((program) => (
              <Card key={program.title} {...program} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" id="historias">
        <div className="container">
          <SectionHeader
            eyebrow="Historias"
            title="Voces que dan sentido al camino"
            description="Cada historia puede incorporar imagen, título, resumen y enlace a una página ampliada."
          />
          <div className="card-grid">
            {stories.map((story) => (
              <Card key={story.title} title={story.title} description={story.description} href={story.href}>
                <div className="story-image-placeholder" aria-label={story.imageAlt}>
                  Imagen
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" id="impacto">
        <div className="container">
          <SectionHeader
            eyebrow="Impacto"
            title="Datos preparados para conectarse a métricas reales"
            description="Estos indicadores podrán alimentarse más adelante desde CMS, base de datos o informes internos."
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

      <section className="page-section" id="colaborar">
        <div className="container">
          <SectionHeader
            eyebrow="Colaborar"
            title="Distintas formas de sumar"
            description="La sección recoge las vías principales de participación y puede convertirse después en páginas independientes."
          />
          <div className="card-grid four-columns">
            {collaborationOptions.map((option) => (
              <Card key={option.title} {...option} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" id="eventos">
        <div className="container">
          <SectionHeader
            eyebrow="Próximos eventos"
            title="Carreras, retos y actividades solidarias"
            description="Cada evento queda estructurado con fecha, nombre, ubicación y enlace."
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

      <section className="page-section" id="transparencia">
        <div className="container split-section">
          <SectionHeader
            eyebrow="Transparencia"
            title="Claridad sobre cada ayuda recibida"
            description="Espacio para explicar el uso de las donaciones, resultados e informes públicos."
          />
          <div className="content-stack">
            <p>
              Esta sección está preparada para publicar documentos, memorias, resultados de
              campañas y criterios de asignación de ayudas.
            </p>
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

      <section className="final-cta">
        <div className="container final-cta-content">
          <h2>Tu ayuda puede aliviar el camino de una familia</h2>
          <p>
            Cada aportación, cada hora y cada gesto ayudan a sostener una red de apoyo real.
          </p>
          <div className="action-row">
            <Link className="button button-primary" to="/donaciones">
              Donar
            </Link>
            <Link className="button button-secondary" to="/voluntariado">
              Colaborar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
