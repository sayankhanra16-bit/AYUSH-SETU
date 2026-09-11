export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-card border rounded-lg p-4 mb-3">
      <SkeletonLine width="w-1/3" height="h-5" />
      <div className="mt-2"><SkeletonLine width="w-1/2" height="h-3" /></div>
      <div className="mt-3 flex gap-2">
        <SkeletonLine width="w-16" height="h-6" />
        <SkeletonLine width="w-16" height="h-6" />
        <SkeletonLine width="w-16" height="h-6" />
      </div>
    </div>
  );
}

export function SkeletonStatRow({ count = 4 }) {
  return (
    <div className="flex gap-4 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl shadow-sm p-4 flex-1">
          <SkeletonLine width="w-2/3" height="h-3" />
          <div className="mt-2"><SkeletonLine width="w-1/2" height="h-6" /></div>
        </div>
      ))}
    </div>
  );
}