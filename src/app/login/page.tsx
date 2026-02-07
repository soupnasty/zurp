import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* Logo icon */}
          <div className="mb-4 flex justify-center">
            <svg width="50" height="34" viewBox="0 0 50 34" fill="none">
              <rect x="0" y="0" width="50" height="34" rx="5" stroke="var(--accent)" strokeWidth="2.5" opacity="0.4" />
              <line x1="0" y1="12" x2="50" y2="12" stroke="var(--accent)" strokeWidth="1.2" opacity="0.2" />
              <circle cx="12" cy="24" r="2.5" fill="var(--accent)" />
              <circle cx="21" cy="24" r="2.5" fill="var(--accent)" opacity="0.55" />
              <circle cx="30" cy="24" r="2.5" fill="var(--accent)" opacity="0.2" />
            </svg>
          </div>
          <h1 className="text-h2 font-semibold tracking-tight">Welcome to zurp</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Sign in with your email to get started.
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
