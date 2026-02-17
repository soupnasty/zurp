import { Mail } from "lucide-react";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[var(--accent)]/10 p-4">
            <Mail
              size={28}
              strokeWidth={1.75}
              className="text-[var(--accent)]"
            />
          </div>
        </div>
        <h1 className="text-h2 font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          We sent a sign-in link to{" "}
          {email ? (
            <>
              <span className="text-[var(--text-primary)] font-medium">
                {email}
              </span>
              .
            </>
          ) : (
            "your inbox."
          )}
        </p>
        <p className="mt-6 text-[var(--text-caption)] text-[var(--text-secondary)]">
          Should arrive within a minute.
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          Check spam or{" "}
          <a href="/login" className="text-[var(--accent)] hover:opacity-80">
            try again
          </a>
          .
        </p>
      </div>
    </div>
  );
}
