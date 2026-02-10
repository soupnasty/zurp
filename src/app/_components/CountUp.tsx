"use client";

import { useRef, useEffect } from "react";

/**
 * Animates a number from 0 to `target` with an ease-out-cubic curve.
 * Starts counting when the element scrolls into view, after `delay` ms.
 */
export function CountUp({
  target,
  prefix = "",
  delay = 0,
  duration = 1800,
  className = "",
  style,
}: {
  target: number;
  prefix?: string;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          timer = setTimeout(() => {
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent =
                prefix + Math.round(eased * target).toLocaleString();
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [target, prefix, delay, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}0
    </span>
  );
}
