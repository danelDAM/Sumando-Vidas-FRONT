import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicEvents } from "../services/publicData";

function getTimelineDateParts(date: string | null, fallback: string) {
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
  const { data: events, loading, error } = usePublicQuery("events", getPublicEvents, null);
  const confirmedEvents = (events ?? []).filter((event) => event.schedule_status === "confirmed");
  const eventsToConfirm = (events ?? []).filter((event) => event.schedule_status === "pending");

  return (
    <>
      <section className="page-section page-hero">
        <div className="container page-hero-content">
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

          <PublicDataStatus
            loading={loading}
            error={error}
            empty={!loading && !error && (events?.length ?? 0) === 0}
            emptyMessage="Todavía no hay eventos publicados."
          />

          <div className="events-timeline" aria-label="Cronología de las medias maratones">
            {confirmedEvents.map((event) => (
              <article className="event-timeline-item" key={event.id}>
                <div className="event-timeline-marker" aria-label={event.starts_on ?? "Fecha por confirmar"}>
                  {getTimelineDateParts(event.starts_on, "Fecha por confirmar").map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </div>
                <div className="event-timeline-card">
                  <div className="event-timeline-content">
                    <div>
                      <p className="eyebrow">{event.city}</p>
                      <h2>{event.title}</h2>
                      {event.description && <p>{event.description}</p>}
                    </div>
                    <div className="event-timeline-meta">
                      {event.distance_km && <span>{event.distance_km.toLocaleString("es-ES")} km</span>}
                      {event.official_url && (
                        <a href={event.official_url} target="_blank" rel="noreferrer">
                          Web oficial
                        </a>
                      )}
                      {event.registration_url && (
                        <a href={event.registration_url} target="_blank" rel="noreferrer">
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
              <article className="event-pending-card" key={event.id}>
                <span>{String(confirmedEvents.length + index + 1).padStart(2, "0")}</span>
                <p className="eyebrow">{event.city}</p>
                <h2>{event.title}</h2>
                {event.description && <p>{event.description}</p>}
                {event.official_url && (
                  <a href={event.official_url} target="_blank" rel="noreferrer">
                    Consultar web oficial
                  </a>
                )}
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
