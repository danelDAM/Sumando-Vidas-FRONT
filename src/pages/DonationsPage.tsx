import { useState } from "react";
import { Link } from "react-router-dom";
import { createDonationCheckoutSession } from "../services/stripe";

const donationOptions = [10, 25, 50, 100];
type DonationMode = "single" | "subscription";
type SubscriptionFrequency = "month" | "year";

export function DonationsPage() {
  const [mode, setMode] = useState<DonationMode>("single");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("month");
  const [amount, setAmount] = useState("25");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
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
      setFeedback("Introduce una cantidad mayor que 0 para continuar.");
      return;
    }

    if (mode === "subscription") {
      setFeedback(
        "La opción de suscripción está preparada en esta página. El backend deberá activar el modo recurrente de Stripe antes de ponerla en producción.",
      );
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const checkoutUrl = await createDonationCheckoutSession(numericAmount, "Sumando Vidas");
      window.location.assign(checkoutUrl);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo iniciar la donación.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-section donations-hero">
        <div className="container donations-hero-content">
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
              <span>Pago seguro con Stripe</span>
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

            <div className="donation-summary">
              <span>{mode === "single" ? "Aportación total" : `Tu apoyo ${frequency === "month" ? "mensual" : "anual"}`}</span>
              <strong>{formattedAmount} €{mode === "subscription" ? ` / ${frequency === "month" ? "mes" : "año"}` : ""}</strong>
            </div>

            <button className="button button-primary donation-submit" type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Preparando pago…" : mode === "single" ? "Donar ahora" : "Crear mi suscripción"}
            </button>

            {feedback && (
              <div className={`donation-page-feedback ${mode === "subscription" ? "is-info" : "is-error"}`} role="status">
                {feedback}
              </div>
            )}

            <p className="donation-legal-note">
              Al continuar serás dirigido a una pasarela segura. No almacenamos los datos de tu tarjeta en esta web.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
