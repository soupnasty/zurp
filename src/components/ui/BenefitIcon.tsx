import {
  Plane,
  ConciergeBell,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  Tv,
  Music,
  CreditCard,
} from "lucide-react";

const lucideMap: Record<string, React.ComponentType<any>> = {
  Plane,
  ConciergeBell,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  Tv,
  Music,
  CreditCard,
};

/** Maps Lucide icon keys to Simple Icons CDN slugs for brand logos */
const brandIconMap: Record<string, string> = {
  Bike: "doordash",
  Car: "lyft",
  Dumbbell: "peloton",
  Tv: "apple",
  Music: "apple",
  Ticket: "stubhub",
};

interface BenefitIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function BenefitIcon({ icon, size = 20, className = "text-[var(--accent)]" }: BenefitIconProps) {
  const brandSlug = brandIconMap[icon];

  if (brandSlug) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${brandSlug}/white`}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ filter: "var(--benefit-icon-invert, none)" }}
      />
    );
  }

  const LucideIcon = lucideMap[icon] || CreditCard;
  return <LucideIcon size={size} strokeWidth={1.75} className={className} style={{ color: "var(--benefit-icon-color)" }} />;
}
