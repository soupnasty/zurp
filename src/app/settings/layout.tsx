import { requireAuth } from "@/lib/auth-helpers";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return <AppShell userEmail={user.email ?? undefined}>{children}</AppShell>;
}
