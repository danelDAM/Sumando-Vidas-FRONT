import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
import { PublicDataStatus } from "../components/ui/PublicDataStatus";
import { RaceScrollStory } from "../components/ui/RaceScrollStory";
import { usePublicQuery } from "../hooks/usePublicQuery";
import { getPorEllosPublicData, type PublicProduct } from "../services/publicData";
import { fallbackCampaigns, fallbackCampaignStops, fallbackEvents, fallbackProducts, fallbackProjects, mergePublicRows } from "../data/publicFallbacks";
import { createDonationCheckoutSession } from "../services/payments";
import { CityPodium3D } from "../components/ui/CityPodium3D";

const donationOptions = [10, 25, 50, 100];

type DonationFeedback = {
  type: "error" | "success" | "info";
  message: string;
};

export function PorEllosProjectPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error } = usePublicQuery("por-ellos", getPorEllosPublicData, null);
  const [activeRaceIndex, setActiveRaceIndex] = useState(0);
  const [selectedRaceCity, setSelectedRaceCity] = useState("");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [selectedStoreItem, setSelectedStoreItem] = useState<PublicProduct | null>(null);
  const [isAnonymousDonation, setIsAnonymousDonation] = useState(true);
  const [donorType, setDonorType] = useState<"person" | "company">("person");
  const [donorName, setDonorName] = useState("");
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [donationFeedback, setDonationFeedback] = useState<DonationFeedback | null>(null);

  const project = data?.project ?? fallbackProjects[0];
  const campaign = data?.campaign ?? fallbackCampaigns[0];
  const stops = mergePublicRows(data?.stops, fallbackCampaignStops, (stop) => String(stop.stop_number)).sort(
    (first, second) => first.stop_number - second.stop_number,
  );
  const events = mergePublicRows(data?.events, fallbackEvents, (event) => event.slug);
  const products = mergePublicRows(data?.products, fallbackProducts, (product) => product.slug);
  const cityTotals = new Map((data?.cityLeaderboard ?? []).map((entry) => [entry.stop_number, entry]));
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const races = stops.map((stop) => {
    const event = stop.event_id ? eventsById.get(stop.event_id) : undefined;
    const date = event?.starts_on
      ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${event.starts_on}T00:00:00`))
      : stop.label ?? `Parada ${stop.stop_number}`;
    const distance = stop.distance_km ?? event?.distance_km;
    const statusLabels: Record<string, string> = {
      planned: t("porEllos.stopStatus.planned"),
      ready: t("porEllos.stopStatus.ready"),
      in_progress: t("porEllos.stopStatus.inProgress"),
      completed: t("porEllos.stopStatus.completed"),
      cancelled: t("porEllos.stopStatus.cancelled"),
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
  const leaderboardRows = races
    .map((race) => ({
      ...race,
      total: cityTotals.get(race.stop.stop_number)?.amount ?? null,
      currency: cityTotals.get(race.stop.stop_number)?.currency ?? campaign.currency,
    }))
    .sort((firstRace, secondRace) => {
      if (firstRace.total === null || secondRace.total === null || firstRace.total === secondRace.total) {
        return firstRace.stop.stop_number - secondRace.stop.stop_number;
      }

      return secondRace.total - firstRace.total;
    });
  const hasCityDonations = leaderboardRows.some((race) => (race.total ?? 0) > 0);
  const leadingCityTotal = Math.max(0, ...leaderboardRows.map((race) => race.total ?? 0));
  const formatCityAmount = (amount: number | null, currency: string) => amount === null
    ? t("porEllos.cityLeaderboard.pendingAmount")
    : new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language || "es", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

  const selectCity = (race: (typeof leaderboardRows)[number]) => {
    setSelectedRaceCity(race.city);
    setActiveRaceIndex(races.findIndex((item) => item.stop.id === race.stop.id));
  };

  const renderCityRow = (race: (typeof leaderboardRows)[number], index: number) => {
    const progress = leadingCityTotal > 0 && race.total !== null
      ? Math.round((race.total / leadingCityTotal) * 100)
      : 0;

    return (
      <button
        className={`leaderboard-row ${selectedRaceCity === race.city ? "is-selected" : ""}`}
        key={race.stop.id}
        type="button"
        onClick={() => selectCity(race)}
        aria-pressed={selectedRaceCity === race.city}
      >
        <span className="leaderboard-rank">{index + 1}</span>
        <span className="leaderboard-city">
          <strong>{race.city}</strong>
          <span>{race.status}</span>
        </span>
        <span className="leaderboard-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
        <strong className="leaderboard-amount">{formatCityAmount(race.total, race.currency)}</strong>
      </button>
    );
  };

  const openDonationModal = (amount?: number) => {
    setDonationFeedback(null);
    setSelectedStoreItem(null);
    setIsCustomAmount(false);
    setIsAnonymousDonation(true);
    setDonorType("person");
    setDonorName("");
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
    setIsAnonymousDonation(true);
    setDonorType("person");
    setDonorName("");
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setDonationFeedback(null);
    setIsSubmittingDonation(false);
    setIsDonationModalOpen(false);
  };

  useEffect(() => {
    if (!isDonationModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDonationFeedback(null);
        setIsSubmittingDonation(false);
        setIsDonationModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDonationModalOpen]);

  const handleDonationSubmit = async () => {
    const parsedAmount = Number(donationAmount);

    if (!selectedStoreItem && (!Number.isFinite(parsedAmount) || parsedAmount <= 0)) {
      setDonationFeedback({
        type: "error",
        message: t("payments.amountInvalid"),
      });
      return;
    }

    if (!isAnonymousDonation && donorName.trim().length < 2) {
      setDonationFeedback({
        type: "error",
        message: t("payments.nameRequired"),
      });
      return;
    }

    if (!data?.campaign.id || !activeRace?.stop.id) {
      setDonationFeedback({ type: "error", message: t("payments.campaignUnavailable") });
      return;
    }

    setIsSubmittingDonation(true);
    setDonationFeedback({
      type: "info",
      message: t("payments.preparing"),
    });

    try {
      const payment = await createDonationCheckoutSession({
        campaignId: data.campaign.id,
        campaignStopId: activeRace.stop.id,
        productId: selectedStoreItem?.id,
        amount: selectedStoreItem ? undefined : parsedAmount,
        currency: campaign.currency,
        participantType: donorType,
        isAnonymous: isAnonymousDonation,
        donorName,
      });
      navigate(`/donaciones/estado?donation_id=${encodeURIComponent(payment.donationId)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("payments.startFailed");

      setDonationFeedback({ type: "error", message });
      setIsSubmittingDonation(false);
    }
  };

  return (
    <>
      <RaceScrollStory
        statusLabel={campaign.status === "active" ? t("porEllos.story.activeCampaign") : campaign.status}
        title={project.title}
        description={project.description}
        cities={races.map((race) => race.city)}
        goalAmount={campaign.goal_amount}
        raisedAmount={data?.cityLeaderboard ? data.cityLeaderboard.reduce((total, entry) => total + Number(entry.amount), 0) : null}
        currency={campaign.currency}
        quickAmounts={donationOptions}
        onQuickDonate={openDonationModal}
        ctaHref="#ranking-ciudades"
      />

      {error && <section className="page-section"><div className="container"><PublicDataStatus loading={false} error="No se pudo actualizar el contenido; mostramos la información disponible." empty={false} /></div></section>}
      {loading && <p className="container" role="status">Actualizando información…</p>}

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
              <span>{products.length} productos</span>
            </div>

            {products.length > 0 ? <div className="store-item-list">
              {products.map((item) => (
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

      <section className="page-section city-ranking reveal-group" id="ranking-ciudades" data-reveal>
        <div className="container">
          <SectionHeader
            eyebrow={t("porEllos.cityLeaderboard.eyebrow")}
            title={t("porEllos.cityLeaderboard.title")}
            description={t("porEllos.cityLeaderboard.description")}
          />
          <div className="city-leaderboard" aria-label={t("porEllos.cityLeaderboard.ariaLabel")}>
            <div className="leaderboard-intro">
              <strong>
                {hasCityDonations
                  ? t("porEllos.cityLeaderboard.leadingCity", { city: leaderboardRows[0].city })
                  : t("porEllos.cityLeaderboard.starting")}
              </strong>
              <span>
                {hasCityDonations
                  ? t("porEllos.cityLeaderboard.paidOnly")
                  : data?.cityLeaderboard.length
                    ? t("porEllos.cityLeaderboard.zeroNotice")
                    : t("porEllos.cityLeaderboard.unavailable")}
              </span>
            </div>
            <CityPodium3D
              label={t("porEllos.cityLeaderboard.ariaLabel")}
              hasDonations={hasCityDonations}
              places={leaderboardRows.slice(0, 3).map((race, index) => ({
                key: race.stop.id,
                city: race.city,
                rank: (index + 1) as 1 | 2 | 3,
                amount: formatCityAmount(race.total, race.currency),
                status: race.status,
                selected: selectedRaceCity === race.city,
              }))}
              onSelect={(key) => {
                const race = leaderboardRows.find((row) => row.stop.id === key);
                if (race) {
                  selectCity(race);
                }
              }}
              fallback={
                <div className={`city-podium ${hasCityDonations ? "has-donations" : ""}`}>
                  {leaderboardRows.slice(0, 3).map((race, index) => (
                    <button
                      key={race.stop.id}
                      type="button"
                      className={`city-podium-place city-podium-place--${index + 1} ${selectedRaceCity === race.city ? "is-selected" : ""}`}
                      onClick={() => selectCity(race)}
                      aria-pressed={selectedRaceCity === race.city}
                    >
                      <span className="city-podium-label">
                        <strong>{race.city}</strong>
                        <span>{formatCityAmount(race.total, race.currency)}</span>
                      </span>
                      <span className="city-podium-block">
                        <span className="city-podium-face city-podium-face--top" aria-hidden="true" />
                        <span className="city-podium-face city-podium-face--left" aria-hidden="true" />
                        <span className="city-podium-face city-podium-face--right" aria-hidden="true" />
                        <b>{index + 1}</b>
                        <small>{race.status}</small>
                      </span>
                    </button>
                  ))}
                </div>
              }
            />
            {leaderboardRows.length > 3 && (
              <div className="leaderboard-chasers">
                <p>{hasCityDonations ? t("porEllos.cityLeaderboard.otherStops") : t("porEllos.cityLeaderboard.upcomingStops")}</p>
                <div className="leaderboard-list">
                  {leaderboardRows.slice(3).map((race, index) => renderCityRow(race, index + 3))}
                </div>
              </div>
            )}
            <Link className="button button-primary leaderboard-cta" to="/donaciones">
              {t("porEllos.cityLeaderboard.supportCity")}
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

            {selectedStoreItem ? (
              <div className="donation-fixed-amount">
                <span>{t("payments.fixedAmount")}</span>
                <strong>
                  {selectedStoreItem.price_amount.toLocaleString("es-ES")} {selectedStoreItem.currency}
                </strong>
              </div>
            ) : (
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
            )}

            {!selectedStoreItem && isCustomAmount && (
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

            <label className="donation-anonymous-toggle" htmlFor="donation-anonymous">
              <input
                id="donation-anonymous"
                type="checkbox"
                checked={isAnonymousDonation}
                onChange={(event) => setIsAnonymousDonation(event.target.checked)}
              />
              <span>{t("payments.anonymousDonation")}</span>
            </label>

            {!isAnonymousDonation && (
              <div className="donation-type-group" aria-label="Tipo de donante">
                <span className="donation-type-label">¿Eres empresa o persona?</span>
                <div className="donation-type-options">
                  <button
                    type="button"
                    className={donorType === "person" ? "is-selected" : ""}
                    onClick={() => setDonorType("person")}
                  >
                    Persona
                  </button>
                  <button
                    type="button"
                    className={donorType === "company" ? "is-selected" : ""}
                    onClick={() => setDonorType("company")}
                  >
                    Empresa
                  </button>
                </div>
              </div>
            )}

            {!isAnonymousDonation && (
              <>
                <label className="donation-name-field" htmlFor="donor-name">
                  {t("payments.nameForLeaderboard")}
                </label>
                <input
                  id="donor-name"
                  type="text"
                  value={donorName}
                  onChange={(event) => setDonorName(event.target.value)}
                  placeholder={t("payments.namePlaceholder")}
                  maxLength={80}
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
                disabled={isSubmittingDonation || !import.meta.env.DEV}
                aria-busy={isSubmittingDonation}
              >
                {!import.meta.env.DEV
                  ? t("payments.developmentOnly")
                  : isSubmittingDonation
                    ? t("payments.preparing")
                    : `Confirmar ${Number(donationAmount || 0).toLocaleString("es-ES")} €`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
