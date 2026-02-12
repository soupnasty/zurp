"use client";

import React, { useRef, useEffect, type ReactNode } from "react";

/**
 * Wrapper that adds a `.mock-active` CSS class when the element scrolls
 * into view. Animations defined in globals.css are scoped to `.mock-active`
 * so they only play when visible.
 */
export function AnimatedMockup({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
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
    <div ref={ref} className={`mock-container ${className}`} style={style}>
      {children}
    </div>
  );
}
