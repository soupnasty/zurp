import { ExternalLink } from "lucide-react";
import type { CardReferenceLinks } from "@/lib/points/perk-matrix";

interface CardSourceLinksProps {
  links: CardReferenceLinks[];
}

export function CardSourceLinks({ links }: CardSourceLinksProps) {
  return (
    <div className="mt-5 pt-5 border-t border-[var(--border-default)]">
      <div className="label-caps text-[var(--text-secondary)] mb-3.5">
        Learn more from the source
      </div>

      <div className="flex flex-wrap gap-6">
        {links.map((card) => (
          <div key={card.cardId} className="flex-1 min-w-[180px]">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1.5">
              {card.cardName}
            </p>
            <div className="flex flex-col gap-1">
              {card.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-[var(--accent)] hover:underline transition-colors duration-[var(--duration-fast)]"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
