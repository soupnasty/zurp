"use client";

import { useRef, useEffect, type ReactNode } from "react";

/**
 * Wrapper that adds a `.mock-active` CSS class when the element scrolls
 * into view. Animations defined in globals.css are scoped to `.mock-active`
 * so they only play when visible.
 */
export function AnimatedMockup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("mock-active");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`mock-container ${className}`}>
      {children}
    </div>
  );
}
