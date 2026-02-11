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
  ShoppingBag,
  Hotel,
  ShoppingCart,
  Shield,
  Activity,
  Coffee,
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
  ShoppingBag,
  Hotel,
  ShoppingCart,
  Shield,
  Activity,
  Coffee,
};

interface BenefitIconProps {
  icon: string;
  brandSlug?: string;
  size?: number;
  className?: string;
}

export function BenefitIcon({ icon, brandSlug, size = 20, className = "text-[var(--accent)]" }: BenefitIconProps) {
  if (brandSlug) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${brandSlug}/white`}
        alt=""
        width={size}
        height={size}
        className={className}
      />
    );
  }

  const LucideIcon = lucideMap[icon] || CreditCard;
  return <LucideIcon size={size} strokeWidth={1.75} className={className} style={{ color: "var(--benefit-icon-color)" }} />;
}
