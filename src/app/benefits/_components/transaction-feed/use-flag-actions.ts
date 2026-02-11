import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import type { TransactionWithMatch, BenefitUsageSummary } from "@/lib/types";

export function useFlagActions(
  getAmbiguousCandidates: (tx: TransactionWithMatch) => BenefitUsageSummary[],
  getEligibleBenefits: (txDate: Date) => BenefitUsageSummary[]
) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { addToast } = useToast();

  const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());
  const [pendingAdds, setPendingAdds] = useState<Map<string, string>>(new Map());
  const [pendingSkips, setPendingSkips] = useState<Set<string>>(new Set());

  const handleRemove = useCallback(
    async (tx: TransactionWithMatch, reason: string) => {
      if (!tx.benefitId || !tx.benefitUsageId) return;

      setPendingRemoves((prev) => new Set(prev).add(tx.id));

      try {
        const res = await fetch("/api/benefits/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: tx.id,
            benefitId: tx.benefitId,
            benefitUsageId: tx.benefitUsageId,
            flagType: "removed",
            reason,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const flagId = data.flag.id;

        addToast(`Transaction removed from ${tx.matchedBenefitName}`, async () => {
          await fetch("/api/benefits/flag", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagId }),
          });
          startTransition(() => {
            setPendingRemoves((prev) => {
              const next = new Set(prev);
              next.delete(tx.id);
              return next;
            });
            router.refresh();
          });
        });

        startTransition(() => {
          setPendingRemoves((prev) => {
            const next = new Set(prev);
            next.delete(tx.id);
            return next;
          });
          router.refresh();
        });
      } catch (err) {
        console.error("Failed to remove match:", err);
        setPendingRemoves((prev) => {
          const next = new Set(prev);
          next.delete(tx.id);
          return next;
        });
      }
    },
    [addToast, router]
  );

  const handleAdd = useCallback(
    async (tx: TransactionWithMatch, benefit: BenefitUsageSummary) => {
      setPendingAdds((prev) => new Map(prev).set(tx.id, benefit.benefitName));

      try {
        const res = await fetch("/api/benefits/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: tx.id,
            benefitId: benefit.benefitId,
            flagType: "added",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const flagId = data.flag.id;

        addToast(`Transaction added to ${benefit.benefitName}`, async () => {
          await fetch("/api/benefits/flag", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagId }),
          });
          startTransition(() => {
            setPendingAdds((prev) => {
              const next = new Map(prev);
              next.delete(tx.id);
              return next;
            });
            router.refresh();
          });
        });

        startTransition(() => {
          setPendingAdds((prev) => {
            const next = new Map(prev);
            next.delete(tx.id);
            return next;
          });
          router.refresh();
        });
      } catch (err) {
        console.error("Failed to add match:", err);
        setPendingAdds((prev) => {
          const next = new Map(prev);
          next.delete(tx.id);
          return next;
        });
      }
    },
    [addToast, router]
  );

  const handleSkip = useCallback(
    async (tx: TransactionWithMatch) => {
      setPendingSkips((prev) => new Set(prev).add(tx.id));

      const candidates = getAmbiguousCandidates(tx);
      const benefitId = candidates[0]?.benefitId ?? getEligibleBenefits(tx.date)[0]?.benefitId;
      if (!benefitId) return;

      try {
        const res = await fetch("/api/benefits/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: tx.id,
            benefitId,
            flagType: "skipped",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const flagId = data.flag.id;

        addToast("Transaction skipped", async () => {
          await fetch("/api/benefits/flag", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagId }),
          });
          startTransition(() => {
            setPendingSkips((prev) => {
              const next = new Set(prev);
              next.delete(tx.id);
              return next;
            });
            router.refresh();
          });
        });

        startTransition(() => {
          setPendingSkips((prev) => {
            const next = new Set(prev);
            next.delete(tx.id);
            return next;
          });
          router.refresh();
        });
      } catch (err) {
        console.error("Failed to skip transaction:", err);
        setPendingSkips((prev) => {
          const next = new Set(prev);
          next.delete(tx.id);
          return next;
        });
      }
    },
    [addToast, router, getAmbiguousCandidates, getEligibleBenefits]
  );

  return { pendingRemoves, pendingAdds, pendingSkips, handleRemove, handleAdd, handleSkip };
}
