import { Badge } from "@/components/ui/Badge";
import { BenefitCard } from "./BenefitCard";
import type { BenefitGroup } from "../page";

export function UpcomingBenefits({ benefits }: { benefits: BenefitGroup[] }) {
  if (benefits.length === 0) return null;

  return (
    <div className="mt-[var(--space-lg)]">
      <div className="flex items-center gap-2 mb-[var(--space-md)]">
        <h2 className="label-caps">Upcoming Benefits</h2>
        <Badge variant="neutral">{benefits.length}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((group) => (
          <BenefitCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
