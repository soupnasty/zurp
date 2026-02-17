import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* Logo icon */}
          <div className="mb-4 flex justify-center">
            <svg width="50" height="38" viewBox="0 0 46 36" fill="none">
              <rect
                x="2"
                y="2"
                width="42"
                height="30"
                rx="5"
                fill="#0a0e17"
                stroke="#22d3ee"
                strokeWidth="1.5"
              />
              <clipPath id="login-t">
                <rect x="8" y="9" width="30" height="6" rx="3" />
              </clipPath>
              <g clipPath="url(#login-t)">
                <rect x="8" y="9" width="18" height="6" fill="#60a5fa" />
                <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa" />
                <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171" />
              </g>
              <clipPath id="login-b">
                <rect x="8" y="19" width="30" height="6" rx="3" />
              </clipPath>
              <g clipPath="url(#login-b)">
                <rect
                  x="8"
                  y="19"
                  width="5.5"
                  height="6"
                  fill="#f87171"
                  opacity="0.5"
                />
                <rect
                  x="13.5"
                  y="19"
                  width="6.5"
                  height="6"
                  fill="#a78bfa"
                  opacity="0.5"
                />
                <rect
                  x="20"
                  y="19"
                  width="18"
                  height="6"
                  fill="#60a5fa"
                  opacity="0.5"
                />
              </g>
            </svg>
          </div>
          <h1 className="text-h2 font-semibold tracking-tight">
            Welcome to zurp
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Enter your email to sign in or create an account.
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>

      <footer className="fixed bottom-6 flex gap-4 text-[var(--text-caption)] text-[var(--text-dim)]">
        <a
          href="/privacy"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Privacy
        </a>
        <span>·</span>
        <a
          href="/terms"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Terms
        </a>
        <span>·</span>
        <a
          href="/security"
          className="hover:text-[var(--text-secondary)] transition-colors"
        >
          Security
        </a>
      </footer>
    </div>
  );
}
