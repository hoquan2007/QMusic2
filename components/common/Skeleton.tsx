export function TrackCardSkeleton() {
  return (
    <div className="flex flex-col p-3 rounded-2xl bg-[#12141d]/40 border border-white/[0.03] animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-white/5" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse">
      <div className="w-8 h-4 bg-white/5 rounded" />
      <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-3 bg-white/5 rounded w-1/4" />
      </div>
      <div className="w-12 h-3 bg-white/5 rounded" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TrackCardSkeleton key={i} />
      ))}
    </div>
  );
}

