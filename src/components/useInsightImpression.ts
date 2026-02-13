"use client";

import { useEffect, useRef } from "react";

/**
 * Hook that records an impression when an insight card scrolls into view.
 * Uses Intersection Observer with 50% visibility threshold.
 * Fires once per mount — subsequent views on the same page load are not tracked.
 *
 * Usage:
 *   const ref = useInsightImpression(insight.id, "benefits_page");
 *   return <div ref={ref}>...</div>;
 */
export function useInsightImpression(insightId: string, surface: string) {
  const ref = useRef<HTMLDivElement>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (!ref.current || recorded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !recorded.current) {
          recorded.current = true;
          fetch("/api/insights/impression", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ insightId, surface }),
          }).catch(() => {}); // fire-and-forget, don't block UI
          observer.disconnect();
        }
      },
      { threshold: 0.5 } // 50% of the card must be visible
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [insightId, surface]);

  return ref;
}
