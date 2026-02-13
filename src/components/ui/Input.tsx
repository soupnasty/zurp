import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const descriptionId = (error || helperText) ? `${inputId}-desc` : undefined;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[var(--text-body)] font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            className={`w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] py-2.5 text-[var(--text-body)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 ${
              icon ? "pl-10 pr-3" : "px-3"
            } ${error ? "border-[var(--color-danger)]" : ""} ${className}`}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p
            id={descriptionId}
            className="mt-1.5 text-[var(--text-caption)] text-[var(--text-secondary)]"
          >
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={descriptionId}
            role="alert"
            className="mt-1.5 text-[var(--text-caption)] text-[var(--color-danger)]"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
