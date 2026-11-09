export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

export function RestaurantMenuSkeleton() {
  return (
    <div aria-label="Loading restaurant menu" role="status" className="min-h-screen bg-soft">
      <Skeleton className="h-44 w-full rounded-none md:h-60" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="hidden h-11 w-56 sm:block" />
        </div>
        <Skeleton className="mb-5 h-11 w-full sm:hidden" />
        <div className="mb-6 flex gap-5 overflow-hidden border-b border-border pb-3">
          {[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-4 w-20 shrink-0" />)}
        </div>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-border bg-warm">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
