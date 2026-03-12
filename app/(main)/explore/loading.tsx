export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex gap-4">
          {/* Sidebar skeleton */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-[60px] space-y-3">
              <div className="rounded-lg border border-border bg-card p-3 shadow-card">
                <div className="h-4 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-card">
                <div className="h-4 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1 min-w-0">
            <div className="h-10 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-1.5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 shadow-card"
                >
                  <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
