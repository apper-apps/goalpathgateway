import React from 'react';

const Loading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>
      
      {/* Filter skeleton */}
      <div className="flex space-x-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg w-24"></div>
        ))}
      </div>
      
      {/* Goal cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-card">
            <div className="space-y-4">
              {/* Category badge */}
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
              
              {/* Title */}
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full"></div>
              </div>
              
              {/* Stats */}
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;