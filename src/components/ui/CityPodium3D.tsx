import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PlaceLayout } from "./cityPodium/scene";

export type CityPodiumPlace = {
  key: string;
  city: string;
  rank: 1 | 2 | 3;
  amount: string;
  status: string;
  selected: boolean;
};

type SceneHandle = {
  update(places: { key: string; city: string; rank: 1 | 2 | 3; status: string; selected: boolean }[], hasDonations: boolean): PlaceLayout[];
  resize(width: number, height: number): PlaceLayout[];
  dispose(): void;
};

type CityPodium3DProps = {
  places: CityPodiumPlace[];
  hasDonations: boolean;
  label: string;
  onSelect: (key: string) => void;
  // Shown if WebGL is not available.
  fallback: ReactNode;
};

// 3D podium with a model of each city. three.js is loaded only when the podium is about to be seen.
export function CityPodium3D({ places, hasDonations, label, onSelect, fallback }: CityPodium3DProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const latest = useRef({ places, hasDonations });
  latest.current = { places, hasDonations };
  const [shouldLoad, setShouldLoad] = useState(false);
  const [phase, setPhase] = useState<"loading" | "ready" | "failed">("loading");
  const [layout, setLayout] = useState<PlaceLayout[]>([]);
  const sceneKey = JSON.stringify([hasDonations, places.map((place) => [place.key, place.city, place.rank, place.status, place.selected])]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) {
      return undefined;
    }
    let cancelled = false;
    let handle: SceneHandle | null = null;
    import("./cityPodium/scene")
      .then(({ createCityPodiumScene, isWebGLAvailable }) => {
        const stage = stageRef.current;
        if (cancelled || !canvasRef.current || !stage) {
          return;
        }
        if (!isWebGLAvailable()) {
          setPhase("failed");
          return;
        }
        handle = createCityPodiumScene(canvasRef.current);
        sceneRef.current = handle;
        handle.resize(stage.clientWidth, stage.clientHeight);
        setPhase("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setPhase("failed");
        }
      });
    return () => {
      cancelled = true;
      handle?.dispose();
      sceneRef.current = null;
    };
  }, [shouldLoad]);

  useEffect(() => {
    const handle = sceneRef.current;
    if (phase === "ready" && handle) {
      setLayout(handle.update(latest.current.places, latest.current.hasDonations));
    }
  }, [phase, sceneKey]);

  useEffect(() => {
    const stage = stageRef.current;
    if (phase !== "ready" || !stage || !("ResizeObserver" in window)) {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      const handle = sceneRef.current;
      if (handle) {
        setLayout(handle.resize(stage.clientWidth, stage.clientHeight));
      }
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [phase]);

  if (phase === "failed") {
    return <>{fallback}</>;
  }

  return (
    <div ref={stageRef} className={`city-podium-3d ${phase === "ready" ? "is-ready" : ""} ${hasDonations ? "has-donations" : ""}`} role="group" aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {phase === "ready" &&
        layout.map((item) => {
          const place = places.find((candidate) => candidate.key === item.key);
          if (!place) {
            return null;
          }
          return (
            <button
              key={item.key}
              type="button"
              className={`city-podium-3d-place city-podium-3d-place--${place.rank} ${place.selected ? "is-selected" : ""}`}
              style={{ left: item.left, width: item.width, height: item.bottom }}
              onClick={() => onSelect(place.key)}
              aria-pressed={place.selected}
            >
              <span className="city-podium-3d-label" style={{ left: item.labelX - item.left, top: item.labelY }}>
                <strong>{place.city}</strong>
                <span>{place.amount}</span>
                <small className="sr-only">
                  {place.rank} · {place.status}
                </small>
              </span>
            </button>
          );
        })}
    </div>
  );
}
