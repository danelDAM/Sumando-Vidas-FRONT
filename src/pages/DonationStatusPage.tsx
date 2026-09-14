import { Link, useSearchParams } from "react-router-dom";

type DonationStatusPageProps = {
  status: "success" | "cancel";
};

export function DonationStatusPage({ status }: DonationStatusPageProps) {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const isSuccess = status === "success";

  return (
    <section className="page-section">
      <div className="container" style={{ maxWidth: "760px", textAlign: "center" }}>
        <div
          className="donation-feedback"
          style={{
            borderColor: isSuccess ? "#bbf7d0" : "#fecaca",
            background: isSuccess ? "#f0fdf4" : "#fef2f2",
            color: isSuccess ? "#166534" : "#b91c1c",
          }}
        >
          <p className="eyebrow">{isSuccess ? "Donación realizada" : "Donación cancelada"}</p>
          <h1 style={{ marginBottom: "16px" }}>
            {isSuccess
              ? "¡Muchas gracias por apoyar a Por Ellos!"
              : "La donación no se completó"}
          </h1>
          <p>
            {isSuccess
              ? "Tu aportación ya está en marcha para ayudar a familias y a la campaña solidaria."
              : "No pasa nada; puedes intentarlo de nuevo en cualquier momento."}
          </p>
          {sessionId && isSuccess && (
            <p style={{ marginTop: "12px" }}>
              ID de sesión: <strong>{sessionId}</strong>
            </p>
          )}
        </div>

        <div className="action-row" style={{ justifyContent: "center", marginTop: "24px" }}>
          <Link className="button button-primary" to="/proyectos/por-ellos">
            Volver a la campaña
          </Link>
          <Link className="button button-secondary" to="/">
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
