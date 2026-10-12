import { useEffect, useState, type RefObject } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Progress (0-1) of a tall section scrolled past the viewport, used by the sticky scroll stories.
// With reduced motion the story is shown static at its final state.
export function useScrollProgress(sectionRef: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsStatic(true);
      setProgress(1);
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const scrollable = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top;
      setProgress(scrollable > 0 ? clamp(-top / scrollable) : 1);
    };
    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [sectionRef]);

  return { progress, isStatic };
}
