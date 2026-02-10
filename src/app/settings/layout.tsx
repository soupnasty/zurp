import { requireAuth } from "@/lib/auth-helpers";
import { AppShell } from "@/components/AppShell";
import { getCardProfiles } from "@/lib/queries";
import { getAllCardDefinitions } from "@/lib/cards/index";

export const dynamic = "force-dynamic";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const cardProfiles = await getCardProfiles(user.id!);
  const active = cardProfiles.find((c) => c.isActive) ?? cardProfiles[0];

  const cards = cardProfiles.map((cp) => ({
    cardProfileId: cp.id,
    cardType: cp.cardType,
    cardName: cp.name,
    issuer: cp.issuer,
    accountMask: cp.accountMask,
    issuerCards: getAllCardDefinitions().map((c) => ({
      id: c.id,
      name: c.name,
    })),
  }));

  return (
    <AppShell
      userEmail={user.email ?? undefined}
      cards={cards}
      activeCardId={active?.id}
    >
      {children}
    </AppShell>
  );
}
