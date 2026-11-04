export function ProductsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-1 p-4 sm:p-5">
      <div className="mb-3 h-3 w-40 animate-pulse rounded-full bg-white/10" />
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0"
        >
          <div className="h-11 w-11 animate-pulse rounded-xl bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-2.5 w-1/5 animate-pulse rounded-full bg-white/5" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/5" />
        </div>
      ))}
    </div>
  );
}
