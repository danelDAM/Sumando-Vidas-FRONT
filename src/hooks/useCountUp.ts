import { useEffect, useState } from "react";

// Animates a number from 0 to its target once it is known.
export function useCountUp(target: number | null, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) {
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const amount = Math.min(1, (now - startedAt) / duration);
      setValue(target * (1 - Math.pow(1 - amount, 3)));
      if (amount < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
