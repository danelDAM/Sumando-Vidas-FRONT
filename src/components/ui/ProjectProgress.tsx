import { useTranslation } from "react-i18next";
import { useCountUp } from "../../hooks/useCountUp";

type ProjectProgressStop = {
  id: string;
  city: string;
  status: string;
};

type ProjectProgressProps = {
  label: string;
  goalAmount: number;
  raisedAmount: number | null;
  currency: string;
  stops: ProjectProgressStop[];
};

type HeroesProgressProps = {
  label: string;
  monthTotal: number | null;
  currency: string;
  leaderName: string | null;
};

function useMoneyFormat(currency: string) {
  const { i18n } = useTranslation();
  const formatter = new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language || "es", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return (amount: number) => formatter.format(amount);
}

export function ProjectProgress({ label, goalAmount, raisedAmount, currency, stops }: ProjectProgressProps) {
  const { t } = useTranslation();
  const formatMoney = useMoneyFormat(currency);
  const raisedDisplay = useCountUp(raisedAmount);
  const barPercent = goalAmount > 0 ? Math.min(100, (raisedDisplay / goalAmount) * 100) : 0;
  const percent = raisedAmount !== null && goalAmount > 0 ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) : 0;

  return (
    <aside className="project-progress" aria-label={label}>
      <div className="project-progress-figures">
        <strong>{raisedAmount === null ? "—" : formatMoney(raisedDisplay)}</strong>
        <span>{t("projects.page.stats.ofGoal", { goal: formatMoney(goalAmount) })}</span>
      </div>
      <div
        className="project-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={t("projects.page.stats.percent", { percent })}
      >
        <span style={{ width: `${barPercent}%` }} />
      </div>
      <p className="project-progress-note">{t("projects.page.stats.percent", { percent })}</p>

      {stops.length > 0 && (
        <ol className="project-progress-route">
          {stops.map((stop) => (
            <li
              key={stop.id}
              className={stop.status === "completed" ? "is-done" : stop.status === "in_progress" ? "is-current" : ""}
            >
              <span className="project-progress-dot" aria-hidden="true" />
              <span className="project-progress-city">{stop.city}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

export function HeroesProgress({ label, monthTotal, currency, leaderName }: HeroesProgressProps) {
  const { t } = useTranslation();
  const formatMoney = useMoneyFormat(currency);
  const totalDisplay = useCountUp(monthTotal);
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today.getDate() + 1;
  const monthPercent = Math.round(((today.getDate() - 1) / daysInMonth) * 100);

  return (
    <aside className="project-progress" aria-label={label}>
      <div className="project-progress-figures">
        <strong>{monthTotal === null ? "—" : formatMoney(totalDisplay)}</strong>
        <span>{t("heroesStory.monthTotal")}</span>
      </div>
      <div
        className="project-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={monthPercent}
        aria-label={t("heroesStory.daysLeft", { count: daysLeft })}
      >
        <span style={{ width: `${monthPercent}%` }} />
      </div>
      <p className="project-progress-note">{t("heroesStory.daysLeft", { count: daysLeft })}</p>
      {leaderName && (
        <p className="project-progress-leader">
          <span>{t("heroesStory.leader")}</span>
          <strong>{leaderName}</strong>
        </p>
      )}
    </aside>
  );
}
