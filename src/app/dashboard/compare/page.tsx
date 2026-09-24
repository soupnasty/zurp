import { redirect } from "next/navigation";

/** Compare became Verdict. */
export default async function LegacyComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { card } = await searchParams;
  redirect(typeof card === "string" ? `/dashboard/verdict?card=${card}` : "/dashboard/verdict");
}
