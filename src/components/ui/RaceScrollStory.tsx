import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { cityCoordinates, normalizeCity, spainOutline } from "../../data/spainMap";
import { useCountUp } from "../../hooks/useCountUp";
import { useScrollProgress } from "../../hooks/useScrollProgress";

// Scroll progress (0-1) at which each step starts. Step 0 is the page header.
const stepStarts = [0, 0.16, 0.58, 0.8];
const routeStart = 0.16;
const routeEnd = 0.58;

// Equirectangular projection of mainland Spain, corrected for latitude.
const lonMin = -9.6;
const lonMax = 3.6;
const latMin = 35.8;
const latMax = 44;
const boardWidth = 1000;
const boardHeight = Math.round(
  (boardWidth * (latMax - latMin)) / ((lonMax - lonMin) * Math.cos((40 * Math.PI) / 180)),
);
const project = ([lon, lat]: [number, number]): [number, number] => [
  ((lon - lonMin) / (lonMax - lonMin)) * boardWidth,
  ((latMax - lat) / (latMax - latMin)) * boardHeight,
];
const spainPath = `M${spainOutline.map((point) => project(point).map((value) => value.toFixed(1)).join(" ")).join(" L")} Z`;

// Gently curved route through the stops (Catmull-Rom converted to cubic Bézier segments).
function smoothRoute(points: [number, number][]) {
  if (points.length === 0) {
    return "";
  }

  let path = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    // Low tension keeps sharp turns between distant cities from overshooting.
    const control1 = [current[0] + (next[0] - previous[0]) / 14, current[1] + (next[1] - previous[1]) / 14];
    const control2 = [next[0] - (afterNext[0] - current[0]) / 14, next[1] - (afterNext[1] - current[1]) / 14];
    path += ` C${control1.map((value) => value.toFixed(1)).join(" ")} ${control2.map((value) => value.toFixed(1)).join(" ")} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
  }
  return path;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

type RaceScrollStoryProps = {
  statusLabel: string;
  title: string;
  description: string | null;
  cities: string[];
  goalAmount: number | null;
  raisedAmount: number | null;
  currency: string;
  quickAmounts: number[];
  onQuickDonate: (amount?: number) => void;
  ctaHref: string;
};

export function RaceScrollStory({
  statusLabel,
  title,
  description,
  cities,
  goalAmount,
  raisedAmount,
  currency,
  quickAmounts,
  onQuickDonate,
  ctaHref,
}: RaceScrollStoryProps) {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const runnerRef = useRef<HTMLSpanElement | null>(null);
  const { progress, isStatic } = useScrollProgress(sectionRef);
  const [stopPositions, setStopPositions] = useState<number[]>([]);
  const raisedDisplay = useCountUp(raisedAmount);

  // Stable dependency: the page builds a new cities array on every render.
  const citiesKey = cities.join("|");
  // Stops are placed at their real coordinates; cities without known coordinates are skipped.
  const stops = useMemo(
    () =>
      citiesKey
        .split("|")
        .map((city, index) => ({ city, number: index + 1, coordinates: cityCoordinates[normalizeCity(city)] }))
        .filter((stop) => stop.coordinates)
        .map((stop) => {
          const [x, y] = project(stop.coordinates);
          return { ...stop, x, y };
        }),
    [citiesKey],
  );
  const routePath = useMemo(() => smoothRoute(stops.map((stop): [number, number] => [stop.x, stop.y])), [stops]);
  const routeProgress = clamp((progress - routeStart) / (routeEnd - routeStart));
  const introProgress = clamp(progress / routeStart);
  const activeStep = stepStarts.reduce((current, start, index) => (progress >= start ? index : current), 0);
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language || "es", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  const goalPercent = goalAmount && raisedAmount !== null ? Math.min(100, (raisedAmount / goalAmount) * 100) : 0;

  // The camera dives into the board during the intro and pans while the runner moves.
  const boardStyle = {
    "--board-tilt": `${lerp(28, 56, introProgress).toFixed(2)}deg`,
    "--board-spin": `${lerp(-4, 20, routeProgress).toFixed(2)}deg`,
    "--board-scale": lerp(0.9, 1, introProgress).toFixed(3),
  } as CSSProperties;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }

    // Where each stop falls along the route (0-1), found by sampling the drawn curve.
    const length = path.getTotalLength();
    const samples = 400;
    const points = Array.from({ length: samples + 1 }, (_, index) => path.getPointAtLength((index / samples) * length));
    setStopPositions(
      stops.map((stop) => {
        let closest = 0;
        let closestDistance = Infinity;
        points.forEach((point, index) => {
          const distance = (point.x - stop.x) ** 2 + (point.y - stop.y) ** 2;
          if (distance < closestDistance) {
            closest = index;
            closestDistance = distance;
          }
        });
        return closest / samples;
      }),
    );
  }, [routePath, stops]);

  useEffect(() => {
    const path = pathRef.current;
    const runner = runnerRef.current;
    if (!path || !runner) {
      return;
    }

    const point = path.getPointAtLength(routeProgress * path.getTotalLength());
    runner.style.left = `${(point.x / boardWidth) * 100}%`;
    runner.style.top = `${(point.y / boardHeight) * 100}%`;
  }, [routeProgress]);

  const steps = [
    { title: t("porEllos.story.step2Title", { count: cities.length }), text: t("porEllos.story.step2Text") },
    { title: t("porEllos.story.step3Title"), text: t("porEllos.story.step3Text") },
    { title: t("porEllos.story.step4Title"), text: t("porEllos.story.step4Text") },
  ];
  const finish = stops[stops.length - 1];

  return (
    <section
      ref={sectionRef}
      className={`race-story ${isStatic ? "is-static" : ""} race-story--step-${activeStep}`}
      aria-labelledby="race-story-title"
    >
      <div className="race-story-sticky">
        <div className="container race-story-grid">
          <div className="race-story-copy">
            <ol className="race-story-steps">
              <li className={`race-story-intro ${activeStep === 0 ? "is-active" : ""}`}>
                <p className="eyebrow">{statusLabel}</p>
                <h1 id="race-story-title">{title}</h1>
                {description && <p>{description}</p>}
                <div className="action-row">
                  <button className="button race-story-cta" type="button" onClick={() => onQuickDonate()}>
                    {t("common.donateNow")}
                  </button>
                  <a className="button race-story-ghost" href="#recorrido">
                    {t("porEllos.story.viewRoute")}
                  </a>
                </div>
              </li>
              {steps.map((step, index) => (
                <li key={step.title} className={index + 1 === activeStep ? "is-active" : ""}>
                  <p className="eyebrow">{t("porEllos.story.eyebrow")}</p>
                  <h2>{step.title}</h2>
                  <p>{step.text}</p>
                  {index === steps.length - 1 && (
                    <a className="button race-story-cta" href={ctaHref}>
                      {t("porEllos.cityLeaderboard.supportCity")}
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
            {!isStatic && <p className={`race-story-hint ${progress >= 0.98 ? "is-done" : ""}`} aria-hidden="true">{t("porEllos.story.scrollHint")}</p>}
          </div>

          <div className="race-story-stage">
            <div className="race-story-scene" aria-hidden="true">
              <div className="race-story-board" style={{ ...boardStyle, aspectRatio: `${boardWidth} / ${boardHeight}` }}>
                {[18, 12, 6].map((depth) => (
                  <svg
                    key={depth}
                    className="race-story-depth"
                    viewBox={`0 0 ${boardWidth} ${boardHeight}`}
                    style={{ "--depth": `${depth}px` } as CSSProperties}
                  >
                    <path d={spainPath} />
                  </svg>
                ))}
                <svg viewBox={`0 0 ${boardWidth} ${boardHeight}`}>
                  <defs>
                    <linearGradient id="race-story-land" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2b3b47" />
                      <stop offset="100%" stopColor="#16212a" />
                    </linearGradient>
                    <pattern id="race-story-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M40 0H0V40" />
                    </pattern>
                  </defs>
                  <path className="race-story-land" d={spainPath} />
                  <path className="race-story-land-grid" d={spainPath} />
                  <path ref={pathRef} className="race-story-route-base" d={routePath} />
                  <path
                    className="race-story-route"
                    d={routePath}
                    pathLength={1}
                    style={{ strokeDashoffset: 1 - routeProgress }}
                  />
                </svg>
                {stops.map((stop, index) => (
                  <span
                    key={stop.city}
                    className={`race-story-pin ${routeProgress >= (stopPositions[index] ?? 1) - 0.001 ? "is-reached" : ""}`}
                    style={{
                      left: `${(stop.x / boardWidth) * 100}%`,
                      top: `${(stop.y / boardHeight) * 100}%`,
                      animationDelay: `${index * 0.3}s`,
                    }}
                  >
                    <span className="race-story-upright">
                      <span className="race-story-coin">€</span>
                      <span className="race-story-pin-head">{stop.number}</span>
                      <span className="race-story-pin-stick" />
                      <b>{stop.city}</b>
                    </span>
                  </span>
                ))}
                <span
                  ref={runnerRef}
                  className="race-story-runner"
                  style={stops[0] ? { left: `${(stops[0].x / boardWidth) * 100}%`, top: `${(stops[0].y / boardHeight) * 100}%` } : undefined}
                >
                  <span className="race-story-upright">
                    <img src="/images/fotoFelipeMedina.webp" alt="" />
                  </span>
                </span>
                {finish && (
                  <span
                    className="race-story-trophy"
                    style={{ left: `${(finish.x / boardWidth) * 100}%`, top: `${(finish.y / boardHeight) * 100}%` }}
                  >
                    <span className="race-story-upright">
                      <svg viewBox="0 0 24 24">
                        <path d="M7 4h10v3a5 5 0 0 1-10 0V4Zm-3 1h3v2a3 3 0 0 1-3-2Zm16 0h-3v2a3 3 0 0 0 3-2ZM10 13h4l1 4H9l1-4Zm-3 5h10v2H7v-2Z" />
                      </svg>
                    </span>
                  </span>
                )}
              </div>
            </div>

            <aside className="race-story-goal" aria-label={t("porEllos.story.goalLabel")}>
              <div className="race-story-goal-figures">
                <div>
                  <span>{t("porEllos.story.raisedLabel")}</span>
                  <strong>{raisedAmount === null ? "—" : formatMoney(raisedDisplay)}</strong>
                </div>
                <div>
                  <span>{t("porEllos.story.goalLabel")}</span>
                  <strong>{goalAmount === null ? "—" : formatMoney(goalAmount)}</strong>
                </div>
              </div>
              <div className="race-story-goal-track" aria-hidden="true">
                <span style={{ width: `${goalPercent}%` }} />
              </div>
              <div className="race-story-chips" aria-label={t("porEllos.story.quickDonate")}>
                {quickAmounts.map((amount) => (
                  <button key={amount} type="button" onClick={() => onQuickDonate(amount)}>
                    {formatMoney(amount)}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
