import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getDonationStatus, simulateFakeMoneyOutcome, type DonationPayment } from "../services/payments";
import { getPorEllosPublicData, type PublicCityLeaderboardEntry } from "../services/publicData";

export function DonationStatusPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donation_id");
  const [payment, setPayment] = useState<DonationPayment | null>(null);
  const [leaderboard, setLeaderboard] = useState<PublicCityLeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    if (!donationId) {
      setError(t("payments.missingId"));
      setLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    getDonationStatus(donationId)
      .then((result) => {
        if (isCurrent) setPayment(result);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) setError(requestError instanceof Error ? requestError.message : t("payments.statusFailed"));
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [donationId, t]);

  const refreshCityLeaderboard = async () => {
    try {
      const publicData = await getPorEllosPublicData();
      setLeaderboard(publicData.cityLeaderboard);
    } catch {
      setLeaderboard(null);
    }
  };

  const handleOutcome = async (outcome: "approved" | "cancelled" | "failed") => {
    if (!donationId) return;
    setIsSimulating(true);
    setError(null);
    try {
      await simulateFakeMoneyOutcome(donationId, outcome);
      const verifiedPayment = await getDonationStatus(donationId);
      setPayment(verifiedPayment);
      if (verifiedPayment.status === "paid") await refreshCityLeaderboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("payments.statusFailed"));
    } finally {
      setIsSimulating(false);
    }
  };

  const isPaid = payment?.status === "paid";
  const formattedAmount = payment
    ? new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language, {
        style: "currency",
        currency: payment.currency,
      }).format(payment.amount)
    : null;

  return (
    <section className="page-section">
      <div className="container" style={{ maxWidth: "760px", textAlign: "center" }}>
        <div
          className="donation-feedback"
          style={{
            borderColor: isPaid ? "#bbf7d0" : "#fecaca",
            background: isPaid ? "#f0fdf4" : "#fef2f2",
            color: isPaid ? "#166534" : "#b91c1c",
          }}
        >
          <p className="eyebrow">{t("payments.statusTitle")}</p>
          <h1 style={{ marginBottom: "16px" }}>{loading ? t("payments.checking") : payment ? t(`payments.status.${payment.status}`) : t("payments.unavailable")}</h1>
          {payment && <p>{formattedAmount}</p>}
          {loading && <p role="status">{t("payments.checking")}</p>}
          {error && <p role="alert">{error}</p>}
          {!loading && payment?.status === "pending" && <p>{t("payments.pendingNotice")}</p>}
          {isPaid && <p>{t("payments.paidNotice")}</p>}
        </div>

        {import.meta.env.DEV && payment?.status === "pending" && (
          <div className="donation-modal-actions" style={{ justifyContent: "center", marginTop: "20px" }}>
            <button className="button button-primary" type="button" disabled={isSimulating} onClick={() => void handleOutcome("approved")}>
              {t("payments.simulate.approved")}
            </button>
            <button className="button button-secondary" type="button" disabled={isSimulating} onClick={() => void handleOutcome("cancelled")}>
              {t("payments.simulate.cancelled")}
            </button>
            <button className="button button-secondary" type="button" disabled={isSimulating} onClick={() => void handleOutcome("failed")}>
              {t("payments.simulate.failed")}
            </button>
          </div>
        )}

        {isPaid && leaderboard && (
          <section className="page-section" aria-live="polite">
            <h2>{t("payments.cityLeaderboardTitle")}</h2>
            <ol>
              {leaderboard.slice(0, 3).map((entry) => (
                <li key={entry.campaign_stop_id}>
                  {entry.city}: {new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language, {
                    style: "currency",
                    currency: entry.currency,
                  }).format(entry.amount)}
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="action-row" style={{ justifyContent: "center", marginTop: "24px" }}>
          <Link className="button button-primary" to="/proyectos/por-ellos">
            {t("payments.backCampaign")}
          </Link>
          <Link className="button button-secondary" to="/">
            {t("payments.backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
