export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 card-shadow">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-9 w-9 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-16 rounded-lg" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
      <div className="skeleton h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-40 rounded" />
        <div className="skeleton h-2.5 w-24 rounded" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-6 w-20 rounded-lg" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton h-44 w-full rounded-xl" />
    </div>
  );
}
