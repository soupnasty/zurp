import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "compare";
  const validTabs = ["compare", "track", "insights"];
  const resolvedTab = validTabs.includes(tab) ? tab : "compare";
  const card = typeof params.card === "string" ? `?card=${params.card}` : "";
  redirect(`/dashboard/${resolvedTab}${card}`);
}
