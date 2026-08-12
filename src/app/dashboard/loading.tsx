export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">
      <div className="animate-pulse space-y-6">
        <div
          className="h-8 w-64 rounded-lg"
          style={{ background: "var(--bg-card-hover)" }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
