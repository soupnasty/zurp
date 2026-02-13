/** Resolve the active card from ?card= param, falling back to isActive or first profile. */
export function resolveActiveCard<
  T extends { id: string; isActive: boolean },
>(profiles: T[], cardParam: string | string[] | undefined): T {
  const id = typeof cardParam === "string" ? cardParam : null;
  return (
    (id ? profiles.find((c) => c.id === id) : null) ??
    profiles.find((c) => c.isActive) ??
    profiles[0]
  );
}
