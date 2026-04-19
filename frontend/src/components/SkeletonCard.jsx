export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden h-[100px]">
      <div className="flex h-full">
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 skeleton-shimmer rounded-md w-3/4" />
          <div className="h-3 skeleton-shimmer rounded-md w-1/2" />
          <div className="pt-2 border-t border-slate-200/50 dark:border-white/10 flex gap-2">
            <div className="h-5 skeleton-shimmer rounded-md w-14" />
            <div className="h-5 skeleton-shimmer rounded-md w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
