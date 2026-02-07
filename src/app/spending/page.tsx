import { requireAuth } from "@/lib/auth-helpers";

export default async function SpendingPage() {
  await requireAuth();

  return (
    <div className="p-[var(--space-md)] md:p-[var(--space-lg)]">
      <h1 className="text-h1 font-semibold tracking-tight mb-[var(--space-lg)]">
        Spending
      </h1>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-xl)] text-center">
        <p className="text-[var(--text-secondary)]">
          Spending insights coming soon.
        </p>
      </div>
    </div>
  );
}
