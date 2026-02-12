"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="hidden max-md:block border-none bg-transparent text-[var(--text-primary)] text-2xl leading-none p-1"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? "\u2715" : "\u2630"}
      </button>

      {open && (
        <div className="fixed top-14 left-0 right-0 z-[99] flex flex-col gap-4 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-4">
          <a
            href="#compare"
            onClick={() => setOpen(false)}
            className="text-[var(--text-secondary)] text-[15px] font-medium py-2 hover:text-[var(--text-primary)] transition-colors"
          >
            Compare
          </a>
          <a
            href="#how"
            onClick={() => setOpen(false)}
            className="text-[var(--text-secondary)] text-[15px] font-medium py-2 hover:text-[var(--text-primary)] transition-colors"
          >
            How it works
          </a>
          <a
            href="#track"
            onClick={() => setOpen(false)}
            className="text-[var(--text-secondary)] text-[15px] font-medium py-2 hover:text-[var(--text-primary)] transition-colors"
          >
            Track
          </a>
          <a
            href="#insights"
            onClick={() => setOpen(false)}
            className="text-[var(--text-secondary)] text-[15px] font-medium py-2 hover:text-[var(--text-primary)] transition-colors"
          >
            Insights
          </a>
          <Link
            href="/login"
            className="text-[var(--text-primary)] text-[15px] font-semibold py-2"
          >
            Get started
          </Link>
        </div>
      )}
    </>
  );
}
