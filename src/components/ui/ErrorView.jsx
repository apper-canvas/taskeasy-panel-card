import React from "react";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ 
  error = "Something went wrong", 
  onRetry = null,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
          <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error-500" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-secondary-600 mb-6 max-w-md">
        {error}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorView;