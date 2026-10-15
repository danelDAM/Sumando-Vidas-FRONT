import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createDonationCheckoutSession } from "../services/payments";
import { DonorIdentityFields } from "../components/ui/DonorIdentityFields";

const donationOptions = [10, 25, 50, 100];
type DonationMode = "single" | "subscription";
type SubscriptionFrequency = "month" | "year";

export function DonationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<DonationMode>("single");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("month");
  const [amount, setAmount] = useState("25");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [donorType, setDonorType] = useState<"person" | "company">("person");
  const [donorName, setDonorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const formattedAmount = Number.isFinite(numericAmount) && numericAmount > 0
    ? numericAmount.toLocaleString("es-ES")
    : "0";

  const handleModeChange = (nextMode: DonationMode) => {
    setMode(nextMode);
    setFeedback(null);
    if (nextMode === "single") {
      setIsCustomAmount(false);
      setAmount("25");
    }
  };

  const handleSubmit = async () => {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFeedback(t("payments.amountInvalid"));
      return;
    }

    if (mode === "subscription") {
      setFeedback(t("payments.subscriptionUnavailable"));
      return;
    }

    if (!isAnonymous && donorName.trim().length < 2) {
      setFeedback(t("payments.nameRequired"));
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payment = await createDonationCheckoutSession({
        amount: numericAmount,
        currency: "EUR",
        participantType: donorType,
        isAnonymous,
        donorName,
      });
      navigate(`/donaciones/estado?donation_id=${encodeURIComponent(payment.donationId)}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo iniciar la donación.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-section page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">Tu apoyo cuenta</p>
          <h1>Tu apoyo puede cambiar el camino de una familia</h1>
          <p>
            Elige cómo quieres sumar. Puedes hacer una aportación puntual o mantener tu apoyo con una suscripción.
          </p>
        </div>
      </section>

      <section className="page-section reveal-group" data-reveal>
        <div className="container donations-layout">
          <div className="donations-message">
            <p className="eyebrow">Donar es acompañar</p>
            <h2>Una ayuda concreta puede aliviar un camino enorme.</h2>
            <p>
              Cada aportación ayuda a sostener acompañamiento, recursos y oportunidades para niños y familias afectados por el cáncer infantil.
            </p>
            <div className="donations-trust-list">
              <span>{t("payments.fakeModeLabel")}</span>
              <span>Sin compromiso en la donación puntual</span>
              <span>Apoyo destinado a la causa</span>
            </div>
            <Link className="text-link" to="/proyectos/por-ellos">
              Conocer el proyecto Por Ellos
            </Link>
          </div>

          <div className="donation-builder">
            <div className="donation-mode-tabs" role="tablist" aria-label="Tipo de donación">
              <button
                className={mode === "single" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={mode === "single"}
                onClick={() => handleModeChange("single")}
              >
                Donación puntual
              </button>
              <button
                className={mode === "subscription" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={mode === "subscription"}
                onClick={() => handleModeChange("subscription")}
              >
                Suscripción
              </button>
            </div>

            <div className="donation-builder-heading">
              <p className="card-meta">{mode === "single" ? "Una vez" : "Apoyo recurrente"}</p>
              <h2>{mode === "single" ? "Elige tu aportación" : "Elige cuánto sumar"}</h2>
            </div>

            {mode === "subscription" && (
              <div className="donation-frequency" role="group" aria-label="Frecuencia de suscripción">
                <button
                  className={frequency === "month" ? "is-active" : ""}
                  type="button"
                  onClick={() => setFrequency("month")}
                >
                  Cada mes
                </button>
                <button
                  className={frequency === "year" ? "is-active" : ""}
                  type="button"
                  onClick={() => setFrequency("year")}
                >
                  Cada año
                </button>
              </div>
            )}

            <div className="donation-amount-grid" aria-label="Cantidades de donación">
              {donationOptions.map((option) => (
                <button
                  className={!isCustomAmount && Number(amount) === option ? "is-active" : ""}
                  key={option}
                  type="button"
                  onClick={() => {
                    setAmount(String(option));
                    setIsCustomAmount(false);
                    setFeedback(null);
                  }}
                >
                  {option} €
                  {mode === "subscription" && <small>/{frequency === "month" ? "mes" : "año"}</small>}
                </button>
              ))}
              <button
                className={isCustomAmount ? "is-active" : ""}
                type="button"
                onClick={() => {
                  setIsCustomAmount(true);
                  setAmount("");
                  setFeedback(null);
                }}
              >
                Otra cantidad
              </button>
            </div>

            {isCustomAmount && (
              <label className="donation-custom-field">
                Cantidad personalizada
                <input
                  autoFocus
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="25"
                />
              </label>
            )}

            <DonorIdentityFields
              isAnonymous={isAnonymous}
              onAnonymousChange={setIsAnonymous}
              donorType={donorType}
              onDonorTypeChange={setDonorType}
              donorName={donorName}
              onDonorNameChange={setDonorName}
            />

            <div className="donation-summary">
              <span>{mode === "single" ? "Aportación total" : `Tu apoyo ${frequency === "month" ? "mensual" : "anual"}`}</span>
              <strong>{formattedAmount} €{mode === "subscription" ? ` / ${frequency === "month" ? "mes" : "año"}` : ""}</strong>
            </div>

            <button className="button button-primary donation-submit" type="button" onClick={handleSubmit} disabled={isSubmitting || !import.meta.env.DEV} aria-busy={isSubmitting}>
              {!import.meta.env.DEV
                ? t("payments.developmentOnly")
                : isSubmitting
                  ? t("payments.preparing")
                  : mode === "single" ? "Donar ahora" : "Crear mi suscripción"}
            </button>

            {feedback && (
              <div className={`donation-page-feedback ${mode === "subscription" ? "is-info" : "is-error"}`} role="status">
                {feedback}
              </div>
            )}

            <p className="donation-legal-note">
              {t("payments.testNotice")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
