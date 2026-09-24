import { redirect } from "next/navigation";

/** Folded into Rewards. */
export default async function LegacyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { card } = await searchParams;
  redirect(typeof card === "string" ? `/dashboard?card=${card}` : "/dashboard");
}
