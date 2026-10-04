import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPorEllosPublicData, type PublicProduct } from "../services/publicData";
import { createDonationCheckoutSession } from "../services/stripe";

const donationOptions = [10, 25, 50, 100];

type DonationFeedback = {
  type: "error" | "success" | "info";
  message: string;
};

export function PorEllosProjectPage() {
  const { data, loading, error } = usePublicQuery("por-ellos", getPorEllosPublicData, null);
  const [activeRaceIndex, setActiveRaceIndex] = useState(0);
  const [selectedRaceCity, setSelectedRaceCity] = useState("");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [selectedStoreItem, setSelectedStoreItem] = useState<PublicProduct | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [donationFeedback, setDonationFeedback] = useState<DonationFeedback | null>(null);

  if (loading || error || !data) {
    return (
      <section className="page-section page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">Campaña solidaria</p>
          <h1>Por Ellos</h1>
          <PublicDataStatus loading={loading} error={error} empty={false} />
        </div>
      </section>
    );
  }

  const eventsById = new Map(data.events.map((event) => [event.id, event]));
  const races = data.stops.map((stop) => {
    const event = stop.event_id ? eventsById.get(stop.event_id) : undefined;
    const date = event?.starts_on
      ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${event.starts_on}T00:00:00`))
      : stop.label ?? `Parada ${stop.stop_number}`;
    const distance = stop.distance_km ?? event?.distance_km;
    const statusLabels: Record<string, string> = {
      planned: "En preparación",
      ready: "Preparada",
      in_progress: "En curso",
      completed: "Completada",
      cancelled: "Cancelada",
    };

    return {
      stop,
      event,
      city: stop.city,
      name: stop.title,
      date,
      distance: distance == null ? "" : `${distance.toLocaleString("es-ES")} km`,
      distanceKm: distance ?? 0,
      description: stop.description ?? event?.description ?? "",
      status: statusLabels[stop.status] ?? stop.status,
    };
  });

  if (races.length === 0) {
    return (
      <section className="page-section">
        <div className="container">
          <PublicDataStatus loading={false} error={null} empty emptyMessage="Todavía no hay paradas publicadas para esta campaña." />
        </div>
      </section>
    );
  }

  const activeRaceIndexSafe = Math.min(activeRaceIndex, races.length - 1);
  const activeRace = races[activeRaceIndexSafe];
  const routeProgress = races.length > 1 ? (activeRaceIndexSafe / (races.length - 1)) * 100 : 0;
  const accumulatedDistance = races
    .slice(0, activeRaceIndexSafe + 1)
    .reduce((total, race) => total + race.distanceKm, 0)
    .toLocaleString("es-ES", {
      maximumFractionDigits: 1,
    });
  const totalDistance = races.reduce((total, race) => total + race.distanceKm, 0).toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
  const campaignGoal = data.campaign.goal_amount == null
    ? null
    : new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: data.campaign.currency,
        maximumFractionDigits: 0,
      }).format(data.campaign.goal_amount);

  const openDonationModal = (amount?: number) => {
    setDonationFeedback(null);
    setSelectedStoreItem(null);
    setIsCustomAmount(false);
    if (amount) {
      setDonationAmount(String(amount));
    }
    setIsDonationModalOpen(true);
  };

  const openStoreModal = (item: PublicProduct) => {
    setDonationFeedback(null);
    setSelectedStoreItem(item);
    setIsCustomAmount(false);
    setDonationAmount(String(item.price_amount));
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
        selectedStoreItem?.title || data.project.title,
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
      <section className="por-ellos-hero page-hero">
        <div className="container por-ellos-hero-grid">
          <div className="por-ellos-copy">
            <p className="eyebrow">{data.campaign.status === "active" ? "Campaña activa" : data.campaign.status}</p>
            <h1>{data.project.title}</h1>
            {data.project.description && <p>{data.project.description}</p>}
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
            <strong>{campaignGoal ?? "Sin objetivo publicado"}</strong>
            <div className="donation-chips" aria-label="Donaciones rápidas">
              {donationOptions.map((amount) => (
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
            title={`Una meta, ${races.length} paradas`}
            description="Cada media maratón funciona como una parada del reto. Puedes seleccionar una ciudad para ver sus acciones solidarias."
          />

          <div className="race-experience">
            <div className="race-map-card">
              <div className="race-map-header">
                <div>
                  <p className="card-meta">Recorrido solidario</p>
                  <h3>{totalDistance} km para llegar a la meta</h3>
                </div>
                <span>{Math.round(routeProgress)}% del reto</span>
              </div>

                <div className="race-track" aria-label={`Recorrido de ${races.length} medias maratones`}>
                <div className="race-line" aria-hidden="true">
                  <span style={{ width: `${routeProgress}%` }} />
                </div>
                {races.map((race, index) => (
                  <button
                    className={`race-stop ${index === activeRaceIndex ? "is-active" : ""}`}
                    key={race.stop.id}
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
                  <dt>Número de parada</dt>
                  <dd>{activeRace.stop.stop_number}</dd>
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
              <span>{data.products.length} productos</span>
            </div>

            {data.products.length > 0 ? <div className="store-item-list">
              {data.products.map((item) => (
                <div className="store-item" key={item.id}>
                  <div className="store-item-image">
                    {item.image_url && <img src={item.image_url} alt={item.title} />}
                  </div>
                  <div className="store-item-topline">
                    <span className="store-tag">{item.category}</span>
                    <strong>{item.price_amount.toLocaleString("es-ES")} {item.currency}</strong>
                  </div>
                  <h4>{item.title}</h4>
                  {item.description && <p>{item.description}</p>}
                  <button className="button button-primary" type="button" onClick={() => openStoreModal(item)}>
                    Comprar por {item.price_amount.toLocaleString("es-ES")} {item.currency}
                  </button>
                </div>
              ))}
            </div> : <p role="status">Todavía no hay productos publicados.</p>}
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
                  value={selectedRaceCity || activeRace.city}
                  onChange={(event) => {
                    const city = event.target.value;
                    setSelectedRaceCity(city);
                    setActiveRaceIndex(races.findIndex((race) => race.city === city));
                  }}
                >
                  {races.map((race) => (
                      <option key={race.stop.id} value={race.city}>
                      {race.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="donation-choice-list" aria-label="Opciones de donación">
              {donationOptions.map((amount) => (
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
