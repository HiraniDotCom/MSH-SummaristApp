export default function PlayerSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-24 animate-pulse">
      <div className="max-w-3xl m-auto p-6">
        
        {/* Header Info Section Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-2 w-full sm:w-2/3">
            <div className="h-7 bg-gray-300 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          {/* Finish Button Mock */}
          <div className="h-10 bg-gray-200 rounded-xl w-36 self-start sm:self-center"></div>
        </div>

        <div className="border-b border-gray-200 mb-6"></div>

        {/* Text Paragraph Blocks Skeleton */}
        <div className="space-y-5 mt-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-11/12"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>

      </div>
    </div>
  );
}