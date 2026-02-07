import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
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
          We sent you a magic link.
          <br />
          Click the link in your email to sign in.
        </p>
        <p className="mt-6 text-[var(--text-caption)] text-[var(--text-secondary)]">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <a href="/login" className="text-[var(--accent)] hover:opacity-80">
            try again
          </a>
          .
        </p>
      </div>
    </div>
  );
}
