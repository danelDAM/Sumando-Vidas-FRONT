import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { heroesProject } from "../data/heroes";

type LeaderboardType = "companies" | "people";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getNextMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function getTimeLeft(target: Date): TimeLeft {
  const difference = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString("es-ES")} €`;
}

export function HeroesQueSumanPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("companies");
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(getNextMonthStart()));
  const currentEntries = leaderboardType === "companies" ? heroesProject.companies : heroesProject.people;
  const currentTotal = currentEntries.reduce((total, entry) => total + entry.amount, 0);
  const currentLeader = currentEntries[0];
  const topAmount = Math.max(...heroesProject.historic.map((entry) => entry.amount));

  useEffect(() => {
    const countdownTarget = getNextMonthStart();
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft(countdownTarget)), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(
    () => [
      { value: timeLeft.days, label: "días" },
      { value: timeLeft.hours, label: "horas" },
      { value: timeLeft.minutes, label: "min" },
      { value: timeLeft.seconds, label: "seg" },
    ],
    [timeLeft],
  );

  return (
    <>
      <section className="page-section heroes-project-hero">
        <div className="container heroes-project-hero-grid">
          <div>
            <p className="eyebrow">Proyecto mensual</p>
            <h1>{heroesProject.title}</h1>
            <p>{heroesProject.summary}</p>
            <div className="action-row">
              <Link className="button button-primary" to="/donaciones">
                Sumar mi apoyo
              </Link>
              <a className="button button-secondary" href="#clasificacion">
                Ver clasificación
              </a>
            </div>
          </div>
          <aside className="heroes-countdown" aria-label="Tiempo restante del reto mensual">
            <p className="card-meta">El marcador se reinicia en</p>
            <div className="countdown-grid">
              {countdown.map((unit) => (
                <div key={unit.label}>
                  <strong>{String(unit.value).padStart(2, "0")}</strong>
                  <span>{unit.label}</span>
                </div>
              ))}
            </div>
            <p>La clasificación histórica conserva cada logro.</p>
          </aside>
        </div>
      </section>

      <section className="page-section reveal-group" id="clasificacion" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="Reto de este mes"
            title="¿Quién se pone la corona?"
            description="Empresas y personas compiten en su propia clasificación para transformar cada aportación en impulso para el cáncer infantil."
          />

          <div className="heroes-scoreboard">
            <div className="heroes-scoreboard-header">
              <div>
                <p className="card-meta">Recaudado este mes</p>
                <strong>{formatAmount(currentTotal)}</strong>
              </div>
              <span>Clasificación abierta hasta fin de mes</span>
            </div>
            <div className="heroes-tabs" role="tablist" aria-label="Tipo de participante">
              <button
                className={leaderboardType === "companies" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={leaderboardType === "companies"}
                onClick={() => setLeaderboardType("companies")}
              >
                Empresas
              </button>
              <button
                className={leaderboardType === "people" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={leaderboardType === "people"}
                onClick={() => setLeaderboardType("people")}
              >
                Personas
              </button>
            </div>
            <div className="heroes-monthly-board">
              <div className="heroes-podium">
                {currentEntries.slice(0, 3).map((entry, index) => (
                  <div className={`heroes-podium-place heroes-podium-place--${index + 1}`} key={entry.name}>
                    <span className="heroes-podium-medal">{index === 0 ? "Oro" : index === 1 ? "Plata" : "Bronce"}</span>
                    <strong>{entry.name}</strong>
                    <b>{formatAmount(entry.amount)}</b>
                    <small>{index === 0 ? "Líder del mes" : `A ${formatAmount(currentLeader.amount - entry.amount)} del primer puesto`}</small>
                  </div>
                ))}
              </div>
              <div className="heroes-ranking-list">
                {currentEntries.slice(3).map((entry, index) => (
                  <div className="heroes-ranking-row" key={entry.name}>
                    <span>{index + 4}</span>
                    <strong>{entry.name}</strong>
                    <i aria-hidden="true"><em style={{ width: `${Math.round((entry.amount / currentLeader.amount) * 100)}%` }} /></i>
                    <b>{formatAmount(entry.amount)}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="El salón de la fama"
            title="La historia también cuenta"
            description="El ranking histórico reúne a quienes han mantenido su compromiso más allá de un solo mes."
          />
          <div className="heroes-historic-board">
            {heroesProject.historic.map((entry, index) => (
              <div className="heroes-historic-row" key={`${entry.name}-${entry.type}`}>
                <span className="heroes-historic-rank">{index + 1}</span>
                <div><strong>{entry.name}</strong><small>{entry.type}</small></div>
                <i aria-hidden="true"><em style={{ width: `${Math.round((entry.amount / topAmount) * 100)}%` }} /></i>
                <b>{formatAmount(entry.amount)}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
