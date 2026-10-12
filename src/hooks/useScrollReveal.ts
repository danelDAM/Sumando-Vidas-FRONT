import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const getPendingElements = (root: ParentNode) =>
      Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const revealAll = () => getPendingElements(document).forEach((element) => element.classList.add("is-visible"));
      revealAll();
      const mutationObserver = new MutationObserver(revealAll);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
      return () => mutationObserver.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    getPendingElements(document).forEach((element) => observer.observe(element));

    // Sections mounted after public data loads also need to be observed.
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          if (node.matches("[data-reveal]:not(.is-visible)")) {
            observer.observe(node);
          }
          getPendingElements(node).forEach((element) => observer.observe(element));
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);
}
