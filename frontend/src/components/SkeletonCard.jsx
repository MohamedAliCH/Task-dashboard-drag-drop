export default function SkeletonCard() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full mt-1.5 skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton-shimmer rounded-md w-3/4" />
          <div className="h-3 skeleton-shimmer rounded-md w-1/2" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-white/5 flex gap-2">
        <div className="h-5 skeleton-shimmer rounded-md w-12" />
        <div className="h-5 skeleton-shimmer rounded-md w-16" />
      </div>
    </div>
  );
}
