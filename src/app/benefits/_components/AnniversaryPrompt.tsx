"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { setAnniversaryDate } from "@/app/onboarding/actions";

interface AnniversaryPromptProps {
  cardProfileId: string;
}

export function AnniversaryPrompt({ cardProfileId }: AnniversaryPromptProps) {
  const router = useRouter();
  const [dateStr, setDateStr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!dateStr) return;
    setSaving(true);
    try {
      await setAnniversaryDate(cardProfileId, new Date(dateStr + "T00:00:00"));
      router.refresh();
    } catch {
      // Error handling
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
      <div className="flex items-start gap-3">
        <Info
          size={20}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0 text-[var(--accent)]"
        />
        <div className="flex-1">
          <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
            When did you open your card?
          </p>
          <p className="mt-1 text-[var(--text-caption)] text-[var(--text-secondary)]">
            We couldn&apos;t detect your anniversary date from transactions.
            This helps us track your $300 travel credit cycle accurately.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="box-border w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] py-2 pl-10 pr-3 text-[var(--text-body)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!dateStr}
              loading={saving}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
