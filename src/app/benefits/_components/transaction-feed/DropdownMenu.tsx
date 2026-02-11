interface DropdownMenuProps {
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  align?: "left" | "right";
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export function DropdownMenu({
  isOpen,
  onToggle,
  align = "right",
  trigger,
  children,
  width = "w-44",
}: DropdownMenuProps) {
  return (
    <div className="relative">
      <button onClick={onToggle}>
        {trigger}
      </button>
      {isOpen && (
        <div
          className={`absolute ${align === "left" ? "left-0" : "right-0"} top-full z-10 mt-1 ${width} rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-[var(--glow-sm)]`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
