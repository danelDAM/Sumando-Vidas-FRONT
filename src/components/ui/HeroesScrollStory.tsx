import { useRef, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { PublicLeaderboardEntry } from "../../services/publicData";
import { useCountUp } from "../../hooks/useCountUp";
import { useScrollProgress } from "../../hooks/useScrollProgress";

// Scroll progress (0-1) at which each step starts. Step 0 is the page header (comic cover).
const stepStarts = [0, 0.14, 0.36, 0.58, 0.8];
// Each page flips up over this share of the scroll, centred on the start of the next step.
const flipWindow = 0.1;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type HeroesScrollStoryProps = {
  title: string;
  summary: string | null;
  monthlyEntries: PublicLeaderboardEntry[];
  timeLeft: TimeLeft;
  rankingHref: string;
};

const companyIcon = "M4 21V5l8-3v6l8 3v10H4Zm3-3h2v-2H7v2Zm0-4h2v-2H7v2Zm0-4h2V8H7v2Zm6 8h2v-2h-2v2Zm0-4h2v-2h-2v2Z";
const personIcon = "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-8 9c0-4 3.6-7 8-7s8 3 8 7H4Z";

export function HeroesScrollStory({ title, summary, monthlyEntries, timeLeft, rankingHref }: HeroesScrollStoryProps) {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { progress, isStatic } = useScrollProgress(sectionRef);
  const locale = i18n.resolvedLanguage || i18n.language || "es";
  const monthlyTotal = monthlyEntries.reduce((total, entry) => total + Number(entry.amount), 0);
  const totalDisplay = useCountUp(monthlyEntries.length > 0 ? monthlyTotal : null);

  const activeStep = stepStarts.reduce((current, start, index) => (progress >= start ? index : current), 0);
  const powerLevel = clamp((progress - stepStarts[3]) / (stepStarts[4] - stepStarts[3] - flipWindow / 2));

  // Real public entries only: the leaders shown are those with public consent.
  const topCompany = monthlyEntries.find((entry) => entry.participant_type === "company");
  const topPerson = monthlyEntries.find((entry) => entry.participant_type === "person");
  const leader = [...monthlyEntries].sort((first, second) => Number(second.amount) - Number(first.amount))[0];

  const now = new Date();
  const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(now);
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

  // The comic book sways gently while you read it.
  const bookStyle = {
    "--book-tilt": `${lerp(18, 8, clamp(progress / stepStarts[1])).toFixed(2)}deg`,
    "--book-turn": `${lerp(-16, 12, progress).toFixed(2)}deg`,
  } as CSSProperties;
  const pageFlip = (pageIndex: number) => {
    if (pageIndex >= stepStarts.length - 1) {
      return 0;
    }
    const boundary = stepStarts[pageIndex + 1];
    return clamp((progress - (boundary - flipWindow / 2)) / flipWindow);
  };

  const steps = [
    { title: t("heroesStory.step1Title"), text: t("heroesStory.step1Text") },
    { title: t("heroesStory.step2Title"), text: t("heroesStory.step2Text") },
    { title: t("heroesStory.step3Title"), text: t("heroesStory.step3Text") },
    { title: t("heroesStory.step4Title"), text: t("heroesStory.step4Text") },
  ];
  const countdown = [
    { value: timeLeft.days, label: t("heroesStory.units.days") },
    { value: timeLeft.hours, label: t("heroesStory.units.hours") },
    { value: timeLeft.minutes, label: t("heroesStory.units.minutes") },
    { value: timeLeft.seconds, label: t("heroesStory.units.seconds") },
  ];

  const pages = [
    <div className="comic-page comic-page--cover" key="cover">
      <span className="comic-issue">
        Nº {now.getMonth() + 1} · {monthName} {now.getFullYear()}
      </span>
      <strong className="comic-cover-title">{title}</strong>
      <svg className="comic-cover-emblem" viewBox="0 0 24 24">
        <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
        <path className="comic-cover-emblem-plus" d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4V7Z" />
      </svg>
    </div>,
    <div className="comic-page comic-page--month" key="month">
      <div className="comic-calendar">
        <span className="comic-calendar-month">{monthName}</span>
        <strong>{now.getDate()}</strong>
      </div>
      <span className="comic-caption">{t("heroesStory.daysLeft", { count: timeLeft.days })}</span>
    </div>,
    <div className="comic-page comic-page--versus" key="versus">
      <div className="comic-side comic-side--company">
        <svg viewBox="0 0 24 24"><path d={companyIcon} /></svg>
        <span>{t("heroesStory.companies")}</span>
        <b>{topCompany?.display_name ?? "?"}</b>
      </div>
      <div className="comic-side comic-side--person">
        <svg viewBox="0 0 24 24"><path d={personIcon} /></svg>
        <span>{t("heroesStory.people")}</span>
        <b>{topPerson?.display_name ?? "?"}</b>
      </div>
      <span className="comic-burst comic-burst--vs">VS</span>
    </div>,
    <div className="comic-page comic-page--power" key="power" style={{ "--power": powerLevel.toFixed(3) } as CSSProperties}>
      <div className="comic-shield">
        <svg viewBox="0 0 24 24">
          <defs>
            <clipPath id="comic-shield-clip">
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
            </clipPath>
          </defs>
          <path className="comic-shield-base" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
          <rect className="comic-shield-fill" clipPath="url(#comic-shield-clip)" x="0" y={22 - powerLevel * 20} width="24" height="24" />
          <path className="comic-shield-outline" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
        </svg>
        <strong>{formatMoney(totalDisplay * powerLevel)}</strong>
      </div>
      {["one", "two", "three", "four"].map((position) => (
        <span key={position} className={`comic-pop comic-pop--${position}`}>+€</span>
      ))}
    </div>,
    <div className="comic-page comic-page--hero" key="hero">
      <span className="comic-rays" />
      <svg className="comic-hero-crown" viewBox="0 0 24 24">
        <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Zm2 13h14v2H5v-2Z" />
      </svg>
      <svg className="comic-hero" viewBox="0 0 64 80">
        <path className="comic-hero-cape" d="M20 26c-6 14-10 30-14 46 10-4 18-4 26 0 8-4 16-4 26 0-4-16-8-32-14-46H20Z" />
        <circle cx="32" cy="14" r="9" />
        <path d="M21 26h22l3 22h-6l-2 22h-12l-2-22h-6l3-22Z" />
      </svg>
      <span className="comic-podium">1</span>
      <span className="comic-caption comic-caption--leader">
        <small>{t("heroesStory.leader")}</small>
        {leader?.display_name ?? "?"}
      </span>
    </div>,
  ];

  return (
    <section
      ref={sectionRef}
      className={`race-story heroes-story ${isStatic ? "is-static" : ""} race-story--step-${activeStep}`}
      aria-labelledby="heroes-story-title"
    >
      <div className="race-story-sticky">
        <div className="container race-story-grid">
          <div className="race-story-copy">
            <ol className="race-story-steps">
              <li className={`race-story-intro ${activeStep === 0 ? "is-active" : ""}`}>
                <p className="eyebrow">{t("heroesStory.projectLabel")}</p>
                <h1 id="heroes-story-title">{title}</h1>
                {summary && <p>{summary}</p>}
                <div className="action-row">
                  <Link className="button race-story-cta" to="/donaciones">
                    {t("heroesStory.support")}
                  </Link>
                  <a className="button race-story-ghost" href={rankingHref}>
                    {t("heroesStory.viewRanking")}
                  </a>
                </div>
              </li>
              {steps.map((step, index) => (
                <li key={step.title} className={index + 1 === activeStep ? "is-active" : ""}>
                  <p className="eyebrow">{t("heroesStory.eyebrow")}</p>
                  <h2>{step.title}</h2>
                  <p>{step.text}</p>
                  {index === steps.length - 1 && (
                    <a className="button race-story-cta" href={rankingHref}>
                      {t("heroesStory.viewRanking")}
                    </a>
                  )}
                </li>
              ))}
            </ol>
            <div className="race-story-dots" aria-hidden="true">
              {stepStarts.map((start, index) => (
                <span key={start} className={index <= activeStep ? "is-active" : ""} />
              ))}
            </div>
            {!isStatic && <p className={`race-story-hint ${progress >= 0.98 ? "is-done" : ""}`} aria-hidden="true">{t("heroesStory.scrollHint")}</p>}
          </div>

          <div className="race-story-stage">
            <div className="race-story-scene" aria-hidden="true">
              <div className="comic-book" style={bookStyle}>
                <span className="comic-book-rings" />
                {pages.map((page, index) => {
                  const flip = isStatic ? (index < pages.length - 1 ? 1 : 0) : pageFlip(index);
                  return (
                    <div
                      key={index}
                      className={`comic-sheet ${index === activeStep ? "is-current" : ""}`}
                      style={{ zIndex: pages.length - index, "--flip": flip.toFixed(3) } as CSSProperties}
                    >
                      {page}
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="race-story-goal heroes-story-card" aria-label={t("heroesStory.resetIn")}>
              <div className="race-story-goal-figures">
                <div>
                  <span>{t("heroesStory.monthTotal")}</span>
                  <strong>{formatMoney(totalDisplay)}</strong>
                </div>
                <div>
                  <span>{t("heroesStory.resetIn")}</span>
                  <strong className="heroes-story-countdown">
                    {countdown.map((unit) => (
                      <span key={unit.label}>
                        {String(unit.value).padStart(2, "0")}
                        <small>{unit.label}</small>
                      </span>
                    ))}
                  </strong>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
