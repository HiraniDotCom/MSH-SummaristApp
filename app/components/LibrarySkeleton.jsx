export default function LibrarySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 animate-pulse">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section Skeleton */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-9 bg-gray-300 rounded-lg w-48 sm:w-64"></div>
          
          {/* Navigation Tabs Mock */}
          <div className="flex bg-gray-200 p-1 rounded-xl w-56 h-10"></div>
        </header>

        {/* Books Grid Skeleton (Matches your responsive grid layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-95">
              <div className="flex flex-col gap-3">
                {/* Book Cover Image Placeholder */}
                <div className="w-full aspect-3/4 bg-gray-200 rounded-xl"></div>
                
                {/* Title Line */}
                <div className="h-4 bg-gray-300 rounded w-5/6 mt-1"></div>
                
                {/* Author Line */}
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              
              {/* Footer Meta Row */}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}