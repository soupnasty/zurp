"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await signIn("resend", {
        email,
        callbackUrl: "/benefits",
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-[var(--text-body)] font-medium text-[var(--text-primary)]"
        >
          Email address
        </label>
        <div className="relative mt-1.5">
          <Mail
            size={16}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] py-2.5 pl-10 pr-3 text-[var(--text-body)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
      </div>

      <p className="text-[var(--text-caption)] leading-snug text-[var(--text-secondary)]">
        By continuing, you agree to our{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="text-[var(--accent)] hover:opacity-80"
        >
          Privacy Policy
        </Link>
        .
      </p>

      {error && (
        <p className="text-[var(--text-caption)] text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!email}
        loading={loading}
        className="w-full"
      >
        Continue with Email
      </Button>

      <p className="text-center text-[var(--text-caption)] text-[var(--text-secondary)]">
        We&apos;ll send you a magic link to sign in.
      </p>
    </form>
  );
}
