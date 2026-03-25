export default function SkeletonCard() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
