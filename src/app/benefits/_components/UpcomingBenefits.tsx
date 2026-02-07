"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BenefitCard } from "./BenefitCard";
import type { BenefitGroup } from "../page";

export function UpcomingBenefits({ benefits }: { benefits: BenefitGroup[] }) {
  const [open, setOpen] = useState(false);

  if (benefits.length === 0) return null;

  return (
    <div className="mt-[var(--space-lg)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 mb-[var(--space-md)] cursor-pointer"
      >
        <ChevronRight
          size={16}
          className="text-[var(--text-secondary)] transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
        <span className="label-caps">Upcoming Benefits</span>
        <Badge variant="neutral">{benefits.length}</Badge>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((group) => (
            <BenefitCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
