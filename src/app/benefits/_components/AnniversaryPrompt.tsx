"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Calendar, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { setAnniversaryDate } from "@/app/onboarding/actions";

interface AnniversaryPromptProps {
  cardProfileId: string;
  hasActivity?: boolean;
}

export function AnniversaryPrompt({ cardProfileId, hasActivity = false }: AnniversaryPromptProps) {
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

  const Icon = hasActivity ? AlertTriangle : Info;
  const borderColor = hasActivity ? "border-[var(--color-warning)]/30" : "border-[var(--accent)]/20";
  const bgColor = hasActivity ? "bg-[var(--color-warning)]/5" : "bg-[var(--accent)]/5";
  const iconColor = hasActivity ? "text-[var(--color-warning)]" : "text-[var(--accent)]";

  return (
    <Card className={`${borderColor} ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon
          size={20}
          strokeWidth={1.75}
          className={`mt-0.5 shrink-0 ${iconColor}`}
        />
        <div className="flex-1">
          <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
            {hasActivity ? "Your benefit tracking is estimated" : "When did you open your card?"}
          </p>
          <p className="mt-1 text-[var(--text-caption)] text-[var(--text-secondary)]">
            {hasActivity
              ? "Without your card anniversary date, credit cycles and ROI may be inaccurate. Set it now to fix your numbers."
              : "We couldn\u2019t detect your anniversary date from transactions. This helps us track your annual benefit cycles accurately."}
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
