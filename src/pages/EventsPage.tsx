import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { raceEvents } from "../data/raceEvents";

function getTimelineDateParts(date: string, fallback: string) {
  if (!date) {
    return [fallback];
  }

  const eventDate = new Date(`${date}T00:00:00`);

  return [
    `${new Intl.DateTimeFormat("es-ES", { day: "numeric" }).format(eventDate)} ${new Intl.DateTimeFormat("es-ES", {
      month: "short",
    })
      .format(eventDate)
      .replace(".", "")}`,
    new Intl.DateTimeFormat("es-ES", { year: "numeric" }).format(eventDate),
  ];
}

export function EventsPage() {
  const confirmedEvents = raceEvents.filter((event) => event.status === "confirmed");
  const eventsToConfirm = raceEvents.filter((event) => event.status === "pending");

  return (
    <>
      <section className="page-section events-hero">
        <div className="container events-hero-content">
            <p className="eyebrow">Agenda Sumando Vidas</p>
            <h1>Eventos para seguir sumando</h1>
          <p>
              Aquí encontrarás las actividades, encuentros y carreras en las que Sumando Vidas participa o colabora para apoyar a niños y familias.
          </p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
              eyebrow="Lo que tenemos en agenda"
              title="Calendario actual"
              description="Por ahora, las medias maratones del proyecto Por Ellos son los primeros eventos publicados. Iremos incorporando nuevas actividades a medida que se confirmen."
          />

          <div className="events-timeline" aria-label="Cronología de las medias maratones">
            {confirmedEvents.map((event) => (
              <article className="event-timeline-item" key={event.city}>
                <div className="event-timeline-marker" aria-label={event.dateLabel}>
                  {getTimelineDateParts(event.date, event.dateLabel).map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </div>
                <div className="event-timeline-card">
                  <div className="event-timeline-content">
                    <div>
                      <p className="eyebrow">{event.city}</p>
                      <h2>{event.title}</h2>
                      <p>{event.description}</p>
                    </div>
                    <div className="event-timeline-meta">
                      <span>{event.distance}</span>
                      <a href={event.officialUrl} target="_blank" rel="noreferrer">
                        Web oficial
                      </a>
                      {event.registrationUrl && (
                        <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                          Inscripciones
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section events-pending-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
              eyebrow="Fechas por confirmar"
              title="Próximas carreras"
              description="Estas carreras ya están contempladas en nuestro calendario, pero todavía estamos pendientes de su fecha oficial."
          />
          <div className="events-pending-grid">
            {eventsToConfirm.map((event, index) => (
              <article className="event-pending-card" key={event.city}>
                <span>{String(confirmedEvents.length + index + 1).padStart(2, "0")}</span>
                <p className="eyebrow">{event.city}</p>
                <h2>{event.title}</h2>
                <p>{event.description}</p>
                <a href={event.officialUrl} target="_blank" rel="noreferrer">
                  Consultar web oficial
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section events-cta reveal-group" data-reveal>
        <div className="container events-cta-inner">
          <div>
              <p className="eyebrow">Sigue la agenda</p>
              <h2>Cada evento es una oportunidad para sumar.</h2>
          </div>
          <Link className="button button-primary" to="/proyectos/por-ellos">
              Conocer Por Ellos
          </Link>
        </div>
      </section>
    </>
  );
}
