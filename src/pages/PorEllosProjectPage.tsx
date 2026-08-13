import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { featuredProject } from "../data/projects";

export function PorEllosProjectPage() {
  const [activeRaceIndex, setActiveRaceIndex] = useState(0);
  const activeRace = featuredProject.races[activeRaceIndex];
  const progress = Math.round((featuredProject.raisedAmount / featuredProject.targetAmount) * 100);
  const routeProgress = (activeRaceIndex / (featuredProject.races.length - 1)) * 100;
  const accumulatedDistance = ((activeRaceIndex + 1) * 21.1).toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });

  return (
    <>
      <section className="por-ellos-hero">
        <div className="container por-ellos-hero-grid">
          <div className="por-ellos-copy">
            <p className="eyebrow">{featuredProject.status}</p>
            <h1>{featuredProject.title}</h1>
            <p>{featuredProject.description}</p>
            <div className="action-row">
              <Link className="button button-primary" to="/donaciones">
                Donar ahora
              </Link>
              <a className="button button-secondary" href="#recorrido">
                Ver recorrido
              </a>
            </div>
          </div>
          <aside className="fundraising-panel" aria-label="Objetivo de recaudación">
            <p className="card-meta">Meta de recaudación</p>
            <strong>{featuredProject.targetAmount.toLocaleString("es-ES")} €</strong>
            <span>{featuredProject.raisedAmount.toLocaleString("es-ES")} € recaudados por ahora</span>
            <div className="progress-track" aria-label={`Progreso de recaudación ${progress}%`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="donation-chips" aria-label="Donaciones rápidas">
              {featuredProject.donationOptions.map((amount) => (
                <Link key={amount} to="/donaciones">
                  {amount} €
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="page-section reveal-group" id="recorrido" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="La carrera completa"
            title="Una meta, cinco paradas"
            description="Cada media maratón funciona como una parada del reto. Puedes seleccionar una ciudad para ver sus acciones solidarias."
          />

          <div className="race-experience">
            <div className="race-map-card">
              <div className="race-map-header">
                <div>
                  <p className="card-meta">Recorrido solidario</p>
                  <h3>105,5 km para llegar a la meta</h3>
                </div>
                <span>{Math.round(routeProgress)}% del reto</span>
              </div>

              <div className="race-track" aria-label="Recorrido de las cinco medias maratones">
                <div className="race-line" aria-hidden="true">
                  <span style={{ width: `${routeProgress}%` }} />
                </div>
                {featuredProject.races.map((race, index) => (
                  <button
                    className={`race-stop ${index === activeRaceIndex ? "is-active" : ""}`}
                    key={race.city}
                    onClick={() => setActiveRaceIndex(index)}
                    type="button"
                    aria-pressed={index === activeRaceIndex}
                  >
                    <span className="race-stop-marker">{index + 1}</span>
                    <span className="race-stop-text">
                      <strong>{race.city}</strong>
                      <small>{race.date}</small>
                    </span>
                  </button>
                ))}
                <span className="finish-label" aria-hidden="true">
                  Meta
                </span>
              </div>
            </div>

            <article className="race-detail-card">
              <p className="card-meta">{activeRace.date}</p>
              <h3>{activeRace.name}</h3>
              <p>{activeRace.description}</p>
              <dl className="race-facts">
                <div>
                  <dt>Distancia</dt>
                  <dd>{activeRace.distance}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{activeRace.status}</dd>
                </div>
                <div>
                  <dt>Km acumulados</dt>
                  <dd>{accumulatedDistance} km</dd>
                </div>
                <div>
                  <dt>Acción clave</dt>
                  <dd>Donar, correr o patrocinar</dd>
                </div>
              </dl>
              <div className="action-row">
                <Link className="button button-primary" to={activeRace.donationUrl}>
                  Donar en esta parada
                </Link>
                <Link className="button button-secondary" to={activeRace.bibUrl}>
                  Comprar dorsal solidario
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="Cómo participar"
            title="Formas de empujar el reto"
            description="Estas acciones son simuladas por ahora, pero la estructura queda lista para pasarelas de pago, dorsales, patrocinio y retos personales."
          />
          <div className="card-grid four-columns">
            {featuredProject.waysToHelp.map((option) => (
              <Link className="card card-interactive" key={option.title} to={option.href}>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <span className="card-link">Empezar</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
