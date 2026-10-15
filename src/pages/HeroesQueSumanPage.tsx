import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { HeroesScrollStory, type TimeLeft } from "../components/ui/HeroesScrollStory";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPublicHeroesData } from "../services/publicData";
import { fallbackProjects } from "../data/publicFallbacks";
import { localizeProject } from "../data/publicContent";

type LeaderboardType = "companies" | "people";

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
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading, error } = usePublicQuery(`heroes-leaderboards-${refreshKey}`, getPublicHeroesData, null);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("companies");
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(getNextMonthStart()));
  const monthlyEntries = data?.monthly ?? [];
  const currentEntries = monthlyEntries.filter((entry) => entry.participant_type === (leaderboardType === "companies" ? "company" : "person"));
  const currentTotal = currentEntries.reduce((total, entry) => total + entry.amount, 0);
  const currentLeaderAmount = currentEntries[0]?.amount ?? 0;
  const historicEntries = data?.historic ?? [];
  const topAmount = historicEntries[0]?.amount ?? 0;

  useEffect(() => {
    const countdownTarget = getNextMonthStart();
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft(countdownTarget)), 1000);

    const refreshData = () => setRefreshKey((current) => current + 1);
    const refreshWhenVisible = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    window.addEventListener("focus", refreshData);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshData);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const project = localizeProject(t, data?.project ?? fallbackProjects[1]);

  return (
    <>
      <HeroesScrollStory
        title={project.title}
        summary={project.summary}
        monthlyEntries={monthlyEntries}
        timeLeft={timeLeft}
        rankingHref="#clasificacion"
      />

      {(loading || error) && <section className="page-section"><div className="container"><PublicDataStatus loading={loading} error={error ? "No se pudo actualizar el ranking; la información del proyecto sigue disponible." : null} empty={false} /></div></section>}

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
                <p className="card-meta">Aportaciones visibles en el ranking este mes</p>
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
              {currentEntries.length > 0 ? (
                <>
                  <div className="heroes-podium">
                    {currentEntries.slice(0, 3).map((entry, index) => (
                      <div className={`heroes-podium-place heroes-podium-place--${index + 1}`} key={entry.participant_id}>
                        <span className="heroes-podium-medal">{index === 0 ? "Oro" : index === 1 ? "Plata" : "Bronce"}</span>
                        <strong>{entry.display_name}</strong>
                        <b>{formatAmount(entry.amount)}</b>
                        <small>{index === 0 ? "Líder del mes" : `A ${formatAmount(currentLeaderAmount - entry.amount)} del primer puesto`}</small>
                      </div>
                    ))}
                  </div>
                  <div className="heroes-ranking-list">
                    {currentEntries.slice(3).map((entry, index) => (
                      <div className="heroes-ranking-row" key={entry.participant_id}>
                        <span>{index + 4}</span>
                        <strong>{entry.display_name}</strong>
                        <i aria-hidden="true"><em style={{ width: `${Math.round((entry.amount / currentLeaderAmount) * 100)}%` }} /></i>
                        <b>{formatAmount(entry.amount)}</b>
                      </div>
                    ))}
                  </div>
                </>
              ) : <PublicDataStatus loading={loading} error={null} empty={!loading} emptyMessage="El ranking mensual se publicará cuando comience el reto y haya aportaciones consentidas." />}
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
            {historicEntries.length > 0 ? historicEntries.map((entry, index) => (
              <div className="heroes-historic-row" key={entry.participant_id}>
                <span className="heroes-historic-rank">{index + 1}</span>
                <div><strong>{entry.display_name}</strong><small>{entry.participant_type === "company" ? "Empresa" : "Persona"}</small></div>
                <i aria-hidden="true"><em style={{ width: `${topAmount ? Math.round((entry.amount / topAmount) * 100) : 0}%` }} /></i>
                <b>{formatAmount(entry.amount)}</b>
              </div>
            )) : <PublicDataStatus loading={loading} error={null} empty={!loading} emptyMessage="El ranking histórico se irá completando con aportaciones y consentimiento público." />}
          </div>
        </div>
      </section>
    </>
  );
}
