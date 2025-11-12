import React from "react";

const Loading = ({ type = "skeleton", className = "" }) => {
  if (type === "skeleton") {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-secondary-200 rounded"></div>
                  <div className="h-2 bg-secondary-200 rounded w-5/6"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-secondary-600 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;