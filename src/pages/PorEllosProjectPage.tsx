import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { featuredProject } from "../data/projects";
import { createDonationCheckoutSession } from "../services/stripe";

type DonationFeedback = {
  type: "error" | "success" | "info";
  message: string;
};

export function PorEllosProjectPage() {
  const [activeRaceIndex, setActiveRaceIndex] = useState(0);
  const [selectedRaceCity, setSelectedRaceCity] = useState(featuredProject.races[0].city);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [selectedStoreItem, setSelectedStoreItem] = useState<(typeof featuredProject.storeItems)[number] | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [donationFeedback, setDonationFeedback] = useState<DonationFeedback | null>(null);

  const activeRace = featuredProject.races[activeRaceIndex];
  const rankedRaces = [...featuredProject.races].sort(
    (firstRace, secondRace) => secondRace.raisedAmount - firstRace.raisedAmount,
  );
  const leadingAmount = rankedRaces[0].raisedAmount;
  const progress = Math.round((featuredProject.raisedAmount / featuredProject.targetAmount) * 100);
  const routeProgress = (activeRaceIndex / (featuredProject.races.length - 1)) * 100;
  const accumulatedDistance = ((activeRaceIndex + 1) * 21.1).toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });

  const openDonationModal = (amount?: number) => {
    setDonationFeedback(null);
    setSelectedStoreItem(null);
    setIsCustomAmount(false);
    if (amount) {
      setDonationAmount(String(amount));
    }
    setIsDonationModalOpen(true);
  };

  const openStoreModal = (item: (typeof featuredProject.storeItems)[number]) => {
    setDonationFeedback(null);
    setSelectedStoreItem(item);
    setIsCustomAmount(false);
    setDonationAmount(String(item.price));
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setDonationFeedback(null);
    setIsSubmittingDonation(false);
    setIsDonationModalOpen(false);
  };

  const handleDonationSubmit = async () => {
    const parsedAmount = Number(donationAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDonationFeedback({
        type: "error",
        message: "Introduce una cantidad válida para continuar.",
      });
      return;
    }

    setIsSubmittingDonation(true);
    setDonationFeedback({
      type: "info",
      message: "Estamos preparando tu donación para Stripe…",
    });

    try {
      const checkoutUrl = await createDonationCheckoutSession(
        parsedAmount,
        selectedStoreItem?.title || featuredProject.title,
        activeRace.city,
      );

      setDonationFeedback({
        type: "success",
        message: "¡Gracias! Te estamos redirigiendo a la pasarela segura de pago…",
      });
      window.location.assign(checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar la donación. Inténtalo otra vez.";

      setDonationFeedback({ type: "error", message });
      setIsSubmittingDonation(false);
    }
  };

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
                <button
                  key={amount}
                  type="button"
                  onClick={() => openDonationModal(amount)}
                >
                  {amount} €
                </button>
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
                  <dt>Recaudado</dt>
                  <dd>{activeRace.raisedAmount.toLocaleString("es-ES")} €</dd>
                </div>
              </dl>
              <div className="action-row">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => openDonationModal(Number(donationAmount))}
                >
                  Donar en esta parada
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="Tienda solidaria"
            title="Compra apoyo en la parada que elijas"
            description="Todo el dinero recaudado va destinado a la campaña Por Ellos. Elige una parada y compra un producto simbólico para apoyar esa etapa concreta del reto."
          />

          <div className="store-stop-card store-selected-stop">
            <div className="store-stop-header">
              <div>
                <p className="card-meta">Productos solidarios</p>
                <h3>Elige tu producto y su ciudad</h3>
              </div>
              <span>{featuredProject.storeItems.length} productos</span>
            </div>

            <div className="store-item-list">
              {featuredProject.storeItems.map((item) => (
                <div className="store-item" key={item.title}>
                  <div className="store-item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="store-item-topline">
                    <span className="store-tag">{item.tag}</span>
                    <strong>{item.price} €</strong>
                  </div>
                  <h4>{item.title}</h4>
                  <p>
                    {item.description} El importe se destina a apoyar la parada de {selectedRaceCity}.
                  </p>
                  <button className="button button-primary" type="button" onClick={() => openStoreModal(item)}>
                    Comprar por {item.price} €
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow="Pique solidario"
            title="¿Qué ciudad va a dar más por ellos?"
            description="La clasificación se actualiza con lo recaudado en cada parada. Aquí no compiten las familias: compite la solidaridad."
          />
          <div className="city-leaderboard" aria-label="Clasificación de recaudación por ciudad">
            <div className="leaderboard-intro">
              <strong>{rankedRaces[0].city} va en cabeza</strong>
              <span>La próxima donación puede cambiar la clasificación.</span>
            </div>
            <div className="leaderboard-podium">
              {rankedRaces.slice(0, 3).map((race, rank) => {
                const cityProgress = Math.round((race.raisedAmount / leadingAmount) * 100);

                return (
                  <button
                    className={`leaderboard-row ${rank < 3 ? `leaderboard-row--top-${rank + 1}` : ""} ${selectedRaceCity === race.city ? "is-selected" : ""}`}
                    key={race.city}
                    type="button"
                    onClick={() => {
                      setSelectedRaceCity(race.city);
                      setActiveRaceIndex(featuredProject.races.findIndex((item) => item.city === race.city));
                    }}
                    aria-pressed={selectedRaceCity === race.city}
                  >
                    <span className="leaderboard-rank">{rank + 1}</span>
                    <span className="leaderboard-city">
                      <strong>{race.city}</strong>
                      <span>{race.status}</span>
                    </span>
                    <span className="leaderboard-progress" aria-hidden="true">
                      <span style={{ width: `${cityProgress}%` }} />
                    </span>
                    <strong className="leaderboard-amount">
                      {race.raisedAmount.toLocaleString("es-ES")} €
                    </strong>
                  </button>
                );
              })}
            </div>
            <div className="leaderboard-chasers">
              <p>Persiguiendo el podio</p>
              <div className="leaderboard-list">
                {rankedRaces.slice(3).map((race, index) => {
                  const cityProgress = Math.round((race.raisedAmount / leadingAmount) * 100);
                  const rank = index + 3;

                  return (
                    <button
                      className={`leaderboard-row ${selectedRaceCity === race.city ? "is-selected" : ""}`}
                      key={race.city}
                      type="button"
                      onClick={() => {
                        setSelectedRaceCity(race.city);
                        setActiveRaceIndex(featuredProject.races.findIndex((item) => item.city === race.city));
                      }}
                      aria-pressed={selectedRaceCity === race.city}
                    >
                      <span className="leaderboard-rank">{rank + 1}</span>
                      <span className="leaderboard-city">
                        <strong>{race.city}</strong>
                        <span>{race.status}</span>
                      </span>
                      <span className="leaderboard-progress" aria-hidden="true">
                        <span style={{ width: `${cityProgress}%` }} />
                      </span>
                      <strong className="leaderboard-amount">
                        {race.raisedAmount.toLocaleString("es-ES")} €
                      </strong>
                    </button>
                  );
                })}
              </div>
            </div>
            <Link className="button button-primary leaderboard-cta" to="/donaciones">
              Haz subir a tu ciudad
            </Link>
          </div>
        </div>
      </section>

      {isDonationModalOpen && (
        <div className="donation-modal-backdrop" onClick={closeDonationModal}>
          <div
            className="donation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="donation-close-button"
              aria-label="Cerrar modal de donación"
              onClick={closeDonationModal}
            >
              ×
            </button>

            <p className="card-meta">
              {selectedStoreItem ? `Compra solidaria: ${selectedStoreItem.title}` : `Apoya la parada de ${activeRace.city}`}
            </p>
            <h3 id="donation-modal-title">
              {selectedStoreItem ? `Apoya ${selectedStoreItem.title}` : "¿Cuánto quieres donar?"}
            </h3>

            {selectedStoreItem && (
              <div className="donation-city-field">
                <label htmlFor="donation-city">¿A qué ciudad quieres apoyar?</label>
                <select
                  id="donation-city"
                  value={selectedRaceCity}
                  onChange={(event) => {
                    const city = event.target.value;
                    setSelectedRaceCity(city);
                    setActiveRaceIndex(featuredProject.races.findIndex((race) => race.city === city));
                  }}
                >
                  {featuredProject.races.map((race) => (
                    <option key={race.city} value={race.city}>
                      {race.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="donation-choice-list" aria-label="Opciones de donación">
              {featuredProject.donationOptions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={Number(donationAmount) === amount ? "is-selected" : ""}
                  onClick={() => {
                    setDonationAmount(String(amount));
                    setIsCustomAmount(false);
                  }}
                >
                  {amount} €
                </button>
              ))}
              <button
                type="button"
                className={isCustomAmount ? "is-selected" : ""}
                onClick={() => {
                  setDonationAmount("");
                  setIsCustomAmount(true);
                }}
              >
                Otra cantidad
              </button>
            </div>

            {isCustomAmount && (
              <>
                <label className="donation-custom-amount" htmlFor="custom-donation-amount">
                  Cantidad personalizada
                </label>
                <input
                  id="custom-donation-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={donationAmount}
                  onChange={(event) => setDonationAmount(event.target.value)}
                />
              </>
            )}

            {donationFeedback && (
              <div className={`donation-feedback donation-feedback--${donationFeedback.type}`}>
                {donationFeedback.message}
              </div>
            )}

            <div className="donation-modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={closeDonationModal}
                disabled={isSubmittingDonation}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleDonationSubmit}
                disabled={isSubmittingDonation}
              >
                {isSubmittingDonation
                  ? "Procesando…"
                  : `Confirmar ${Number(donationAmount || 0).toLocaleString("es-ES")} €`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
